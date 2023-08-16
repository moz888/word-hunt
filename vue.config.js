const path = require('path')
const fs = require('fs')
const { defineConfig } = require('@vue/cli-service')

// Generate pages object
const pages = {}

function getEntryFile(entryPath) {
  let files = fs.readdirSync(entryPath)
  return files
}

const chromeName = getEntryFile(path.resolve(`src/entry`))

function getFileExtension(filename) {
  return /[.]/.exec(filename) ? /[^.]+$/.exec(filename)[0] : undefined
}
chromeName.forEach((name) => {
  const fileExtension = getFileExtension(name)
  const fileName = name.replace('.' + fileExtension, '')
  pages[fileName] = {
    entry: `src/entry/${name}`,
    template: 'public/index.html',
    filename: `${fileName}.html`
  }
  if (name == 'background.js' || name == 'content.js') {
    delete pages[fileName].template
    delete pages[fileName].filename
  }
  console.log(pages[fileName])
})

const isDevMode = process.env.NODE_ENV === 'development'

module.exports = defineConfig({
  pages,
  lintOnSave: false,
  filenameHashing: false,
  chainWebpack: (config) => {
    config.plugin('copy').use(require('copy-webpack-plugin'), [
      {
        patterns: [
          {
            from: path.resolve(`src/manifest.${process.env.NODE_ENV}.json`),
            to: `${path.resolve('dist')}/manifest.json`
          },
          {
            from: path.resolve(`src/css/styles.css`),
            to: `${path.resolve('dist')}/styles.css`
          }
        ]
      }
    ])
  },
  configureWebpack: {
    output: {
      filename: `[name].js`,
      chunkFilename: `[name].js`
    },
    devtool: isDevMode ? 'inline-source-map' : false,
  },
  css: {
    extract: false
  }
  // css: {
  //   extract: {
  //     filename: `[name].css`
  //   } // Make sure the css is the same
  // }
})
