import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

import { CliError } from "./output.mjs"

const LOCKFILES = [
  ["pnpm-lock.yaml", "pnpm"],
  ["bun.lock", "bun"],
  ["bun.lockb", "bun"],
  ["yarn.lock", "yarn"],
  ["package-lock.json", "npm"],
]

const RUNNERS = {
  npm: ["npx"],
  pnpm: ["pnpm", "exec"],
  yarn: ["yarn"],
  bun: ["bunx"],
}

function readJsonc(file) {
  const text = readFileSync(file, "utf8")
  const withoutComments = text.replace(
    /("(?:\\.|[^"\\])*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g,
    (_match, string) => string ?? ""
  )
  return JSON.parse(withoutComments.replace(/,(\s*[}\]])/g, "$1"))
}

function detectPackageManager(cwd) {
  for (let dir = cwd; ; dir = path.dirname(dir)) {
    const match = LOCKFILES.find(([file]) => existsSync(path.join(dir, file)))
    if (match) return match[1]
    if (path.dirname(dir) === dir) return "npm"
  }
}

export function detectProject(cwd) {
  const manifestPath = path.join(cwd, "package.json")
  if (!existsSync(manifestPath)) {
    throw new CliError(
      "No package.json found. Run this inside an Expo project."
    )
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"))
  const packages = { ...manifest.dependencies, ...manifest.devDependencies }
  if (!packages.expo) {
    throw new CliError("Only Expo projects are supported.")
  }
  if (packages.nativewind) {
    throw new CliError(
      "This project uses NativeWind. esuiss components are built on Uniwind."
    )
  }
  if (!existsSync(path.join(cwd, "tsconfig.json"))) {
    throw new CliError(
      "A TypeScript project is required (tsconfig.json not found)."
    )
  }
  return {
    cwd,
    packages,
    packageManager: detectPackageManager(cwd),
  }
}

export function findAliasRoot(cwd) {
  const file = path.join(cwd, "tsconfig.json")
  if (!existsSync(file)) return null
  const options = readJsonc(file).compilerOptions ?? {}
  const target = options.paths?.["@/*"]?.[0]
  if (!target) return null
  return path.resolve(cwd, options.baseUrl ?? ".", target.replace(/\/?\*$/, ""))
}

export function run(project, args) {
  const [command, ...prefix] = RUNNERS[project.packageManager]
  const fullArgs = [...prefix, ...args]
  const result = spawnSync(command, fullArgs, {
    cwd: project.cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  })
  if (result.status !== 0) {
    throw new CliError(`${command} ${fullArgs.join(" ")} failed.`)
  }
}

export function install(project, packages) {
  const missing = [...new Set(packages)].filter(
    (name) => !project.packages[name]
  )
  if (!missing.length) return []
  run(project, ["expo", "install", ...missing])
  for (const name of missing) project.packages[name] = "*"
  return missing
}
