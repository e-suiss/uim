import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import { installItems } from "./add.mjs"
import { CliError, confirm, note, step } from "./output.mjs"
import { detectProject, findAliasRoot, install, run } from "./project.mjs"
import { fetchRegistry, fetchStylesheet } from "./registry.mjs"

const METRO_CONFIGS = ["metro.config.js", "metro.config.cjs"]
const ROOT_COMPONENTS = [
  "src/app/_layout.tsx",
  "app/_layout.tsx",
  "src/App.tsx",
  "App.tsx",
]
const RUNTIME = ["uniwind", "tailwindcss", "@rn-primitives/portal"]
const PORTAL_IMPORT = 'import { PortalHost } from "@rn-primitives/portal"'

function relative(project, file) {
  return path.relative(project.cwd, file)
}

function posix(file) {
  return file.split(path.sep).join("/")
}

function assertTailwindVersion(project) {
  const version = project.packages.tailwindcss
  const major = version && Number(version.match(/\d+/)?.[0])
  if (major && major < 4) {
    throw new CliError(
      `Tailwind CSS v4 is required, this project uses ${version}.`
    )
  }
}

function addAlias(project, target) {
  const file = path.join(project.cwd, "tsconfig.json")
  let text = readFileSync(file, "utf8")
  const alias = `"@/*": ["${target}"]`
  const paths = text.match(/"paths"\s*:\s*\{/)
  const options = text.match(/"compilerOptions"\s*:\s*\{/)
  if (paths) {
    text = text.replace(paths[0], `${paths[0]}\n      ${alias},`)
  } else if (options) {
    text = text.replace(
      options[0],
      `${options[0]}\n    "paths": {\n      ${alias}\n    },`
    )
  } else {
    text = text.replace(
      "{",
      `{\n  "compilerOptions": {\n    "paths": {\n      ${alias}\n    }\n  },`
    )
  }
  writeFileSync(file, text)
}

function ensureAlias(project, sourceRoot) {
  if (findAliasRoot(project.cwd)) return false
  addAlias(
    project,
    sourceRoot === project.cwd ? "./*" : `./${relative(project, sourceRoot)}/*`
  )
  return true
}

function uniwindOptions(project, stylesheet, typesFile) {
  return `{\n  cssEntryFile: "./${posix(relative(project, stylesheet))}",\n  dtsFile: "./${posix(relative(project, typesFile))}",\n}`
}

function configureMetro(project, stylesheet, typesFile) {
  const options = uniwindOptions(project, stylesheet, typesFile)
  const file = METRO_CONFIGS.map((name) => path.join(project.cwd, name)).find(
    existsSync
  )

  if (!file) {
    writeFileSync(
      path.join(project.cwd, "metro.config.js"),
      `const { getDefaultConfig } = require("expo/metro-config")\nconst { withUniwindConfig } = require("uniwind/metro")\n\nconst config = getDefaultConfig(__dirname)\n\nmodule.exports = withUniwindConfig(config, ${options})\n`
    )
    step("Created metro.config.js")
    return []
  }

  const text = readFileSync(file, "utf8")
  if (text.includes("withUniwindConfig")) return []

  const exported = text.match(/module\.exports\s*=\s*([\s\S]+?);?\s*$/)
  if (!exported) {
    return [
      `Wrap the exported config in ${relative(project, file)} with withUniwindConfig from "uniwind/metro".`,
    ]
  }

  const wrapped = `${text.slice(0, exported.index)}module.exports = withUniwindConfig(${exported[1].trim()}, ${options})\n`
  writeFileSync(
    file,
    `const { withUniwindConfig } = require("uniwind/metro")\n${wrapped}`
  )
  step(`Configured ${relative(project, file)}`)
  return []
}

function findRootComponent(project) {
  return ROOT_COMPONENTS.map((name) => path.join(project.cwd, name)).find(
    existsSync
  )
}

function importPath(from, to) {
  const specifier = posix(path.relative(path.dirname(from), to))
  return specifier.startsWith(".") ? specifier : `./${specifier}`
}

function lastImportEnd(text) {
  const imports = [...text.matchAll(/^import[\s\S]*?["'][^"']+["'];?\n/gm)]
  const last = imports.at(-1)
  return last ? last.index + last[0].length : 0
}

function configureRoot(project, stylesheet) {
  const file = findRootComponent(project)
  const cssImport = `import "${importPath(file ?? stylesheet, stylesheet)}"`
  if (!file) {
    return [
      `Add ${cssImport} and render <PortalHost /> from "@rn-primitives/portal" in your root component.`,
    ]
  }

  let text = readFileSync(file, "utf8")
  const original = text
  const manual = []
  const cssName = path.basename(stylesheet)

  if (!new RegExp(`import\\s+["'][^"']*${cssName}["']`).test(text)) {
    text = `${cssImport}\n${text}`
  }

  if (!text.includes("<PortalHost")) {
    const closing = [...text.matchAll(/\n(\s*)<\/(\w[\w.]*)>\n\s*\)/g)].at(-1)
    if (closing) {
      const indent = `${closing[1]}  `
      text = `${text.slice(0, closing.index)}\n${indent}<PortalHost />${text.slice(closing.index)}`
      const end = lastImportEnd(text)
      text = `${text.slice(0, end)}${PORTAL_IMPORT}\n${text.slice(end)}`
    } else {
      manual.push(
        `Render <PortalHost /> from "@rn-primitives/portal" as the last child of your root component in ${relative(project, file)}.`
      )
    }
  }

  if (text !== original) {
    writeFileSync(file, text)
    step(`Configured ${relative(project, file)}`)
  }
  return manual
}

export async function init(options) {
  const project = detectProject(options.cwd)
  assertTailwindVersion(project)

  const sourceRoot = existsSync(path.join(project.cwd, "src"))
    ? path.join(project.cwd, "src")
    : project.cwd
  const stylesheet = path.join(sourceRoot, "global.css")
  const typesFile = path.join(sourceRoot, "uniwind-types.d.ts")

  const stylesheetExists = existsSync(stylesheet)
  if (
    stylesheetExists &&
    readFileSync(stylesheet, "utf8").trim() &&
    !options.yes
  ) {
    const replace = await confirm(
      `Replace ${relative(project, stylesheet)} with the esuiss stylesheet?`
    )
    if (!replace) {
      throw new CliError(
        "Cancelled. Run again with --yes to replace the stylesheet."
      )
    }
  }

  const registry = await fetchRegistry()
  const css = await fetchStylesheet(registry)

  if (ensureAlias(project, sourceRoot))
    step("Added the @/* import alias to tsconfig.json")

  install(project, RUNTIME)

  writeFileSync(stylesheet, css)
  step(`Wrote ${relative(project, stylesheet)}`)

  const manual = [
    ...configureMetro(project, stylesheet, typesFile),
    ...configureRoot(project, stylesheet),
  ]

  await installItems(
    project,
    findAliasRoot(project.cwd) ?? sourceRoot,
    registry,
    ["button"]
  )

  run(project, [
    "uniwind",
    "generate-artifacts",
    "--css",
    `./${posix(relative(project, stylesheet))}`,
    "--dts",
    `./${posix(relative(project, typesFile))}`,
  ])
  step(`Generated ${relative(project, typesFile)}`)

  for (const message of manual) note(message)
  step("Ready. Add components with npx @esuiss/uim add <name>")
}
