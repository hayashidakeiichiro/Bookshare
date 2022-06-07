import {VueLoaderPlugin} from "vue-loader";
import * as path from "path"
const __dirname = new URL(import.meta.url).pathname;

export default {
  mode: "development",
  entry: {
    main: './src/bundle.js'
  },
  output: {
    path: path.join(__dirname, '/../src'),
    publicPath: '/',
    filename: 'main.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        options: {
          // Here you should change 'env' to '@babel/preset-env'
          presets: ['@babel/preset-env'],
        }
      },
      {
        test: /\.vue$/,       
        loader: "vue-loader"
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader',
        ]
      }
     
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    
  ],
resolve: {
    extensions: ['.js', '.vue'],
    modules: [
        "node_modules"
    ],
    alias: {
        // vue.js のビルドを指定する
        vue: 'vue/dist/vue.cjs.js'
    }
},
devtool: "source-map",
devServer: {
    static: {
        directory: "./dist"
    },
    allowedHosts: "all",
},

 
};