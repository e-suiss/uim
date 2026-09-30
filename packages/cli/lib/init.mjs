import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import { installItems } from "./add.mjs"
import { ensureBabelPlugin } from "./babel.mjs"
import { CliError, choose, confirm, note, step } from "./output.mjs"
import {
  detectProject,
  detectStyling,
  findAliasRoot,
  install,
  reinstall,
  run,
  STYLINGS,
} from "./project.mjs"
import { fetchRegistry, fetchStylesheet } from "./registry.mjs"

const METRO_CONFIGS = ["metro.config.js", "metro.config.cjs"]
const ROOT_COMPONENTS = [
  "src/app/_layout.tsx",
  "app/_layout.tsx",
  "src/App.tsx",
  "App.tsx",
]
const PORTAL = "@rn-primitives/portal"
const NATIVEWIND_VERSION = "5.0.0-rc.0"
const LIGHTNINGCSS_VERSION = "1.30.1"
const STYLING_SETUP = {
  uniwind: {
    runtime: ["uniwind", "tailwindcss"],
    pinned: [],
    tooling: [],
    metroImport: 'const { withUniwindConfig } = require("uniwind/metro")',
    metroMarker: "withUniwindConfig",
  },
  nativewind: {
    runtime: [],
    pinned: [`nativewind@${NATIVEWIND_VERSION}`, "react-native-css@3.1.0-rc.0"],
    tooling: [
      "tailwindcss@4.1.12",
      "@tailwindcss/postcss@4.1.12",
      `lightningcss@${LIGHTNINGCSS_VERSION}`,
    ],
    metroImport: 'const { withNativewind } = require("nativewind/metro")',
    metroMarker: "withNativewind",
  },
}
const POSTCSS_CONFIGS = [
  "postcss.config.mjs",
  "postcss.config.js",
  "postcss.config.cjs",
]
const POSTCSS_CONFIG = `export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}
`
const OVERRIDE_FIELDS = {
  npm: ["overrides"],
  bun: ["overrides"],
  yarn: ["resolutions"],
  pnpm: ["pnpm", "overrides"],
}
const METRO_DEFAULTS = {
  expo: 'const { getDefaultConfig } = require("expo/metro-config")',
  "react-native":
    'const { getDefaultConfig } = require("@react-native/metro-config")',
}
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

const PRIMITIVES_RESOLVER = `function withPrimitivesResolver(config) {
  const resolveRequest = config.resolver?.resolveRequest
  return {
    ...config,
    resolver: {
      ...config.resolver,
      resolveRequest(context, moduleName, platform) {
        const next = resolveRequest ?? context.resolveRequest
        const target = moduleName.startsWith("@rn-primitives/")
          ? { ...context, isESMImport: false }
          : context
        return next(target, moduleName, platform)
      },
    },
  }
}
`

function metroHeader(project) {
  const header = `${STYLING_SETUP[project.styling].metroImport}\n`
  return project.framework === "react-native"
    ? `${header}\n${PRIMITIVES_RESOLVER}\n`
    : header
}

function wrapConfig(project, expression, options) {
  const inner =
    project.framework === "react-native"
      ? `withPrimitivesResolver(${expression})`
      : expression
  return project.styling === "uniwind"
    ? `module.exports = withUniwindConfig(${inner}, ${options})\n`
    : `module.exports = withNativewind(${inner})\n`
}

function configureMetro(project, stylesheet, typesFile) {
  const options = uniwindOptions(project, stylesheet, typesFile)
  const file = METRO_CONFIGS.map((name) => path.join(project.cwd, name)).find(
    existsSync
  )

  if (!file) {
    writeFileSync(
      path.join(project.cwd, "metro.config.js"),
      `${METRO_DEFAULTS[project.framework]}\n${metroHeader(project)}\nconst config = getDefaultConfig(__dirname)\n\n${wrapConfig(project, "config", options)}`
    )
    step("Created metro.config.js")
    return []
  }

  const text = readFileSync(file, "utf8")
  const { metroMarker, metroImport } = STYLING_SETUP[project.styling]
  if (text.includes(metroMarker)) return []

  const exported = text.match(/module\.exports\s*=\s*([\s\S]+?);?\s*$/)
  if (!exported) {
    return [
      `Wrap the exported config in ${relative(project, file)} with ${metroMarker} (${metroImport}).`,
    ]
  }

  writeFileSync(
    file,
    `${metroHeader(project)}${text.slice(0, exported.index)}${wrapConfig(project, exported[1].trim(), options)}`
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
    const firstImport = text.search(/^import\s/m)
    const at = firstImport === -1 ? 0 : firstImport
    text = `${text.slice(0, at)}${cssImport}\n${text.slice(at)}`
  }

  if (!text.includes("<PortalHost")) {
    const closing = text.match(/\n(\s*)<\/(\w[\w.]*)>\n\s*\)/)
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

function configureAliasResolver(project, sourceRoot) {
  if (project.framework !== "react-native") return []
  install(project, ["babel-plugin-module-resolver"], { dev: true })
  const aliasRoot = findAliasRoot(project.cwd) ?? sourceRoot
  const target = posix(relative(project, aliasRoot)) || "."
  return ensureBabelPlugin(
    project,
    "module-resolver",
    `["module-resolver", { alias: { "@": "./${target === "." ? "" : target}" } }]`
  )
}

function assertNativewindVersion(project) {
  const version = project.packages.nativewind
  const major = version && Number(version.match(/\d+/)?.[0])
  if (major && major < 5) {
    throw new CliError(
      `NativeWind v5 is required, this project uses ${version}. See https://www.nativewind.dev/v5/guides/migrate-from-v4`
    )
  }
}

function configurePostcss(project) {
  const existing = POSTCSS_CONFIGS.map((name) =>
    path.join(project.cwd, name)
  ).find(existsSync)
  if (!existing) {
    writeFileSync(path.join(project.cwd, "postcss.config.mjs"), POSTCSS_CONFIG)
    step("Created postcss.config.mjs")
    return []
  }
  if (readFileSync(existing, "utf8").includes("@tailwindcss/postcss")) return []
  return [
    `Add "@tailwindcss/postcss" to the plugins in ${relative(project, existing)}.`,
  ]
}

function pinLightningcss(project) {
  const file = path.join(project.cwd, "package.json")
  const manifest = JSON.parse(readFileSync(file, "utf8"))
  const fieldPath = OVERRIDE_FIELDS[project.packageManager]
  let target = manifest
  for (const key of fieldPath) {
    target[key] ??= {}
    target = target[key]
  }
  if (target.lightningcss === LIGHTNINGCSS_VERSION) return
  target.lightningcss = LIGHTNINGCSS_VERSION
  writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`)
  step(`Pinned lightningcss to ${LIGHTNINGCSS_VERSION} in package.json`)
  reinstall(project)
}

function writeNativewindTypes(project) {
  const file = path.join(project.cwd, "nativewind-env.d.ts")
  if (existsSync(file)) return
  writeFileSync(file, '/// <reference types="react-native-css/types" />\n')
  step(`Created ${relative(project, file)}`)
}

async function pickStyling(project, options) {
  const detected = detectStyling(project, options.styling)
  if (detected) return detected
  if (options.yes) return STYLINGS[0]
  const answer = await choose("Which styling library should components use?", [
    "Uniwind",
    "NativeWind v5",
  ])
  return answer === "Uniwind" ? "uniwind" : "nativewind"
}

export async function init(options) {
  const project = detectProject(options.cwd)
  assertTailwindVersion(project)
  project.styling = await pickStyling(project, options)
  if (project.styling === "nativewind") {
    assertNativewindVersion(project)
    if (project.framework === "react-native") {
      throw new CliError(
        "NativeWind v5 needs Expo's Metro config, which requires the expo package. Add Expo modules with `npx install-expo-modules@latest` and run init again, or use --styling uniwind."
      )
    }
  }
  const setup = STYLING_SETUP[project.styling]

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
  const css = await fetchStylesheet(registry, project.styling)

  if (ensureAlias(project, sourceRoot))
    step("Added the @/* import alias to tsconfig.json")

  install(project, [...setup.runtime, PORTAL])
  install(project, setup.pinned, { exact: true })
  install(project, setup.tooling, { dev: true, exact: true })
  if (project.styling === "nativewind") {
    install(project, ["postcss"], { dev: true })
    if (project.framework === "expo") install(project, ["expo-system-ui"])
    pinLightningcss(project)
  }

  writeFileSync(stylesheet, css)
  step(`Wrote ${relative(project, stylesheet)}`)

  const manual = [
    ...configureMetro(project, stylesheet, typesFile),
    ...configureRoot(project, stylesheet),
    ...configureAliasResolver(project, sourceRoot),
    ...(project.styling === "nativewind" ? configurePostcss(project) : []),
  ]

  await installItems(
    project,
    findAliasRoot(project.cwd) ?? sourceRoot,
    registry,
    ["button"],
    { styling: project.styling }
  )

  if (project.styling === "uniwind") {
    run(project, [
      "uniwind",
      "generate-artifacts",
      "--css",
      `./${posix(relative(project, stylesheet))}`,
      "--dts",
      `./${posix(relative(project, typesFile))}`,
    ])
    step(`Generated ${relative(project, typesFile)}`)
  } else {
    writeNativewindTypes(project)
  }

  if (project.framework === "react-native") {
    const cssTypes = path.join(sourceRoot, "css.d.ts")
    if (!existsSync(cssTypes)) {
      writeFileSync(cssTypes, 'declare module "*.css"\n')
      step(`Created ${relative(project, cssTypes)}`)
    }
  }

  for (const message of manual) note(message)
  step("Ready. Add components with npx @esuiss/uim add <name>")
}
