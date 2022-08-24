# README

##  Features

> It is recommended to use jsx to develop components, If you want to develop with .vue
>
> do change with pacckage.json:

```diff
"scripts": {
-  "prepublishOnly": "npm run build",
+  "prepublishOnly": "npm run build:vite",
},
```

- 💻 Vue suport >=3.2.0
- ✈️ Project init with [vite](https://vitejs.dev/)
- 📦 Support cjs & esm


- 🛎 you can write componet with .vue or .tsx

---

- 🪖 [Github Actions](https://docs.github.com/cn/actions) support (Auto CI on pull_request / Auto Release on push tag / Auto Deploy on push & pull_request)
- 🍕 Build npm package with [tsup](https://tsup.egoist.sh/)
- 🍭 Built-in Vue3 dev environment

  > [playground](./playground/vite.config.ts) folder
  >
  > start --> ```npm run dev```

- 🍔 Use [browserslistrc](./.browserslistrc)
- 🪗 Build styles with [postcss](./postcss.config.js) ([postcss-nested](https://www.npmjs.com/package/postcss-nested)/ [autoprefixer](https://www.npmjs.com/package/autoprefixer) / [cssnano](https://cssnano.co/docs/getting-started/))
- 🌭 [Stylelint](https://stylelint.io/) that helps you avoid errors and enforce conventions in your styles.
- 🍟 [Mono repo with npm](https://dev.to/ynwd/how-to-create-react-monorepo-with-npm-workspace-webpack-and-create-react-app-2dhn)
- 🎉 [TypeScript](https://www.typescriptlang.org/), of course
- 🎄 Unit Testing with [Vitest](https://vitest.dev/)
- 🏑 [Storybook](https://storybook.js.org/) for building UI components and pages
- 🧆 [ESLint](https://eslint.org/) statically analyzes your code to quickly find problems.
- ⚒ [Husky](https://typicode.github.io/husky/#/) & [lint-staged](https://github.com/okonet/lint-staged#readme)
- ☕ [Commitlint](https://commitlint.js.org) that helps your team adhering to a commit convention
- 🛸 Deploy Storybook on [Netlify](https://www.netlify.com/) ---> [config](./.github/workflows/deploy.yaml)
- 🥳 [MIT License](https://mit-license.org/)

## how to use

replace ```runafe-threejs``` with your package name

## Directory structure

```js
Project
├── __tests__           # Unit Testing
├── babel.config.js     # babel config
├── package.json
├── playground          # dev environment folder (can use source code)
│   ├── index.html
│   ├── package.json
│   ├── public
│   ├── src
│   ├── tsconfig.json
│   ├── vite-env.d.ts
│   └── vite.config.ts
├── postcss.config.js  # build styles with postcss
├── global.d.ts # global componet type declaration (TIPS: Manual maintenance is required)
├── src                # Package source code
│   ├── index.ts       # Package source entry
│   ├── stories        # storybook for building UI components and pages
│   ├── styles         # styles for Package
│   └── types.ts       # ts type declaration for Package
├── tsconfig.json      # ts config
└── tsup.config.ts     # build package with tsup
```

## Register Components Globally

```js
// main.ts
import InstallPlugin from 'runafe-threejs';

app.use(InstallPlugin());
```

```js
// tsconfig.json
{
  "compilerOptions": {
    "types": [
      "runafe-threejs/global"
    ]
  }
}
```

# runa-threejs
