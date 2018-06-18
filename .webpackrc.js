const path = require('path');

export default {
  entry: 'src/index.js',
  extraBabelPlugins: [
    'transform-decorators-legacy',
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
  ],
  env: {
    development: {
      extraBabelPlugins: ['dva-hmr'],
    },
  },
  alias: {
    'components': path.resolve(__dirname, 'src/components/'),
    'utils': path.resolve(__dirname, 'src/utils/'),
  },
  ignoreMomentLocale: true,
  theme: './src/theme.js',
  html: {
    template: './src/index.ejs',
  },
  publicPath: '/',
  disableDynamicImport: true,
  hash: true,
  proxy: {
    '/api': {
      target: 'http://localhost:9500', // target host
      changeOrigin: false,               // needed for virtual hosted sites
      ws: false,                         // proxy websockets
      pathRewrite: {
        '^/api': '/',     // rewrite path
      },
      proxyTable: {
        'localhost:4000': 'http://localhost:9500',
        'localhost:3000': 'http://localhost:9500',
      },
    },
  },
};
