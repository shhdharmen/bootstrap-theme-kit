![Bootstrap Theme Kit](./bootstrap-theme-kit.png)

# bootstrap-theme-kit

Quickly ⚡ Generate and Showcase 🎯 your bootstrap theme 🎨. [Get Started](#getting-started) or [See sample theme](https://shhdharmen.github.io/bootstrap-theme-kit/).

<!-- Badges -->

[![GitHub license](https://img.shields.io/github/license/shhdharmen/bootstrap-theme-kit)](https://github.com/shhdharmen/bootstrap-theme-kit/blob/master/LICENSE)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## 🚀 Getting Started

### ☑️ Minimum Requirements

```sh
node -v
// v10.17.0
git --version
// git version 2.x
```

### ⬇️ Steps to Follow

1. First, fork this repo.
2. Open terminal and:

```sh
git clone <forked-repo-url>
cd bootstrap-theme-kit
npm i
npm run init
npm start
```

3. Browser will open at 3000 port.
4. Start editing your scss/html files and browser will reload.

## 🏆 Features

- Of course, [Bootstrap](http://getbootstrap.vom)
- [Gulp](http://gulpjs.com)
- [SCSS](https://sass-lang.com/)
- [SCSS-7-in-1](https://sass-guidelin.es/#architecture)
  - **Pro tip:** Quickly generate SCSS 7-in-1 architecture anywhere using [npx scss-7-in-1](https://www.npmjs.com/package/scss-7-in-1)
- Live reload with [Browsersync](https://www.browsersync.io/)
- Linting and Formatting
  - [ESLint](http://eslint.org)
  - [Prettier](http://prettier.io)
  - [Stylelint](http://stylelint.io)
  - **Pro tip:** You can lint using `npm run lint` and fix them using `npm run lint:fix`
- [Commitzen Friendly](http://commitizen.github.io/cz-cli/)
  - **Pro tip:** After staging your files, use `npm run commit` to make commit messages commitzen friendly.
- Changelog and Version Management with [Semantic Release](https://semantic-release.gitbook.io/semantic-release/)
- [Github Actions](https://github.com/features/actions) with
  - [Cache](https://github.com/actions/cache) for faster build
  - Build and Lint scripts
  - [GitHub Pages action](https://github.com/marketplace/actions/github-pages-action)
    - **Pro tip:** As it's deployed to Github Pages, you can also treat it as CDN for your CSS.
