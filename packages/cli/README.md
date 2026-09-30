# @esuiss/uim

Add esuiss components to React Native and Expo projects.

```bash
npx @esuiss/uim@latest init
npx @esuiss/uim@latest add dialog
npx @esuiss/uim@latest add button --diff
npx @esuiss/uim@latest add button --overwrite
```

`init` sets up Uniwind or NativeWind v5 (both Tailwind CSS v4), the `@/*` import alias, the theme stylesheet, the portal host, and the button. In React Native projects without Expo it also sets up the Babel alias resolver and the Reanimated plugin. Requires TypeScript. The styling library is detected from the project, or chosen with `--styling uniwind|nativewind`. NativeWind needs Expo.
