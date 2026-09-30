import { execFileSync } from "node:child_process"
import { existsSync, mkdtempSync, rmSync } from "node:fs"
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

const ROOT = process.cwd()
const SOURCE_DIR = "components/ui"
const OUTPUT_DIR = "nativewind/components/ui"
const SOURCE_STYLESHEET = "styles/uniwind.css"
const OUTPUT_STYLESHEET = "styles/nativewind.css"
const UTILITY_PREFIXES =
  "bg|text|border|border-[trblxyse]|ring|outline|divide|fill|stroke|shadow|decoration|placeholder|accent|caret"

const FILE_TRANSFORMS = {
  "icon.tsx": (code) =>
    code
      .replace(
        'import { withUniwind } from "uniwind"',
        'import { styled } from "nativewind"'
      )
      .replace(
        /const StyledIcon = withUniwind\(IconImpl, \{[\s\S]*?\n\}\)\n/,
        `const StyledIcon = styled(IconImpl, {
  className: {
    target: "style",
    nativeStyleMapping: {
      color: true,
      width: "size",
    },
  },
})
`
      ),
  "input.tsx": usePlaceholderClass,
  "textarea.tsx": usePlaceholderClass,
}

function usePlaceholderClass(code) {
  return code
    .replace(
      '      placeholderTextColorClassName="accent-muted-foreground"\n',
      ""
    )
    .replace(
      /className=\{cn\(\n(\s*)"([^"]*)"/,
      (_match, indent, classes) =>
        `className={cn(\n${indent}"${classes} placeholder:text-muted-foreground"`
    )
}

function parseTheme(css) {
  const block = (name) => {
    const start = css.indexOf(`@variant ${name}`)
    const end = css.indexOf("}", start)
    return Object.fromEntries(
      [...css.slice(start, end).matchAll(/--color-([\w-]+):\s*([^;]+);/g)].map(
        (match) => [match[1], match[2].trim()]
      )
    )
  }
  const radius = css.match(/@theme\s*\{([\s\S]*?)\}/)?.[1].trim() ?? ""
  return { light: block("light"), dark: block("dark"), radius }
}

function parseColor(value) {
  const hex = value.match(/^#([\da-f]{6})$/i)
  if (hex) {
    const channels = hex[1]
      .match(/../g)
      .map((part) => Number.parseInt(part, 16))
    return { channels, alpha: 1 }
  }
  const rgb = value.match(
    /^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:\/\s*([\d.]+))?\s*\)$/
  )
  if (rgb) {
    return {
      channels: rgb.slice(1, 4).map(Number),
      alpha: rgb[4] === undefined ? 1 : Number(rgb[4]),
    }
  }
  throw new Error(`Unsupported color value "${value}"`)
}

function withOpacity(value, percent) {
  const { channels, alpha } = parseColor(value)
  const combined = Math.round(alpha * percent * 10) / 1000
  return `rgb(${channels.join(" ")} / ${combined})`
}

function opacityPattern(colors) {
  const names = [...colors].sort((a, b) => b.length - a.length).join("|")
  return new RegExp(
    `(?<![\\w-])((?:[\\w-]+:)*(?:${UTILITY_PREFIXES})-(${names}))/(\\d{1,3})(?![\\w/])`,
    "g"
  )
}

function collectTokens(sources, pattern) {
  const tokens = new Map()
  for (const code of sources) {
    for (const match of code.matchAll(pattern)) {
      tokens.set(`${match[2]}-${match[3]}`, {
        color: match[2],
        percent: Number(match[3]),
      })
    }
  }
  return [...tokens.entries()].sort(([a], [b]) =>
    a.localeCompare(b, "en", { numeric: true })
  )
}

function buildStylesheet(theme, tokens) {
  const lines = (values, indent) =>
    Object.entries(values)
      .map(([name, value]) => `${indent}--color-${name}: ${value};`)
      .join("\n")
  const tokenValues = (mode) =>
    Object.fromEntries(
      tokens.map(([name, { color, percent }]) => [
        name,
        withOpacity(theme[mode][color], percent),
      ])
    )

  return `@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";
@import "nativewind/theme";

@theme {
${lines(theme.light, "  ")}
${lines(tokenValues("light"), "  ")}
  ${theme.radius.replace(/\n\s*/g, "\n  ")}
}

:root {
  font-size: 16px;
}

@media (prefers-color-scheme: dark) {
  :root {
${lines(theme.dark, "    ")}
${lines(tokenValues("dark"), "    ")}
  }
}
`
}

async function generate(target) {
  const theme = parseTheme(
    await readFile(path.join(ROOT, SOURCE_STYLESHEET), "utf8")
  )
  const colors = new Set(Object.keys(theme.light))
  const pattern = opacityPattern(colors)

  const files = (await readdir(path.join(ROOT, SOURCE_DIR)))
    .filter((file) => file.endsWith(".tsx"))
    .sort()
  const sources = new Map()
  for (const file of files) {
    sources.set(file, await readFile(path.join(ROOT, SOURCE_DIR, file), "utf8"))
  }

  const tokens = collectTokens(sources.values(), pattern)
  const outputs = new Map()
  for (const [file, code] of sources) {
    const transformed = (FILE_TRANSFORMS[file] ?? ((value) => value))(
      code.replace(
        pattern,
        (_match, utility, _color, percent) => `${utility}-${percent}`
      )
    )
    if (transformed !== code) outputs.set(file, transformed)
  }

  await mkdir(path.join(target, OUTPUT_DIR), { recursive: true })
  await mkdir(path.join(target, path.dirname(OUTPUT_STYLESHEET)), {
    recursive: true,
  })
  for (const [file, code] of outputs) {
    await writeFile(path.join(target, OUTPUT_DIR, file), code)
  }
  await writeFile(
    path.join(target, OUTPUT_STYLESHEET),
    buildStylesheet(theme, tokens)
  )

  execFileSync(
    path.join(ROOT, "node_modules/.bin/biome"),
    ["check", "--write", OUTPUT_DIR, OUTPUT_STYLESHEET],
    { cwd: target, stdio: "ignore" }
  )
  return { files: [...outputs.keys()], tokens: tokens.length }
}

async function snapshot(base) {
  const dir = path.join(base, OUTPUT_DIR)
  const files = existsSync(dir) ? (await readdir(dir)).sort() : []
  const entries = await Promise.all(
    files.map(async (file) => [
      file,
      await readFile(path.join(dir, file), "utf8"),
    ])
  )
  const stylesheet = path.join(base, OUTPUT_STYLESHEET)
  return JSON.stringify({
    files: entries,
    stylesheet: existsSync(stylesheet)
      ? await readFile(stylesheet, "utf8")
      : "",
  })
}

if (process.argv.includes("--check")) {
  const temp = mkdtempSync(path.join(tmpdir(), "esuiss-nativewind-"))
  try {
    const biome = JSON.parse(
      await readFile(path.join(ROOT, "biome.json"), "utf8")
    )
    biome.vcs = { enabled: false }
    await writeFile(path.join(temp, "biome.json"), JSON.stringify(biome))
    const { files } = await generate(temp)
    if ((await snapshot(temp)) !== (await snapshot(ROOT))) {
      console.error(
        "NativeWind components are out of date. Run `pnpm nativewind`."
      )
      process.exit(1)
    }
    console.log(`NativeWind components are up to date: ${files.length} files`)
  } finally {
    rmSync(temp, { recursive: true, force: true })
  }
} else {
  rmSync(path.join(ROOT, OUTPUT_DIR), { recursive: true, force: true })
  const { files, tokens } = await generate(ROOT)
  console.log(
    `NativeWind: ${files.length} component files, ${tokens} color tokens`
  )
}
