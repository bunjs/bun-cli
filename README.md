# bun-cli
bun-cli工具是一个融合了多种实用功能的前端命令行工具，它服务于bunjs框架，却不止于bunjs。
[![NPM version](https://img.shields.io/npm/v/bunjs.svg)](https://www.npmjs.com/package/bunjs)
[![NPM downloads](https://img.shields.io/npm/dm/bunjs.svg)](https://www.npmjs.com/package/bunjs)

它主要有以下功能：
- 帮助使用bunjs框架的用户快速构建代码，一键生成初始项目
- 一条命令打包部署bunjs的项目
- 支持热加载，监听改动自动打包重启（仅开发模式下）
- 封装webpack工具，傻瓜式配置，支持非bunjs项目打包
- 内置mock服务，本地开发更便捷
- 内置pm2，帮你更好的监控自己的项目

## 安装：

```
npm i -g bunjs
```
## bunjs框架使用
## 1.构建项目工程框架：

```
bun init project
```
根据提示输入名称,如myProject。
然后cd进入新创建的project目录，执行：

```
npm install
```
一个项目工程构建完成。
## 2.创建app
然后退回到上一级目录，并创建一个新的app：

```
cd ..
bun init app
```
根据提示输入app名称,如myapp。
然后cd进入新创建的app目录，执行：

```
npm install
```
## 3.编译部署
然后编译当前app内容到工程目录：

```
bun r -d -t ../myProject
```
开发环境下，可加上：

-d参数：使用开发模式打包编译（不会进行压缩等）

-w参数：实时监听文件修改，自动打包编译

## 5.启动项目
然后，回到project目录，启动项目：

```
cd myProject
bun run myProject
```
默认端口是8000，打开http://localhost:8000/myapp/home 即可看到示例页面
## 6.其它
工具内置了pm2作为进程保护，可以监听文件修改自动重新启动，你可以执行：

```
bun restart myProject //重启项目
bun stop myProject //停止项目
bun run myProject -w //自动重启项目
```
### vue
我们对react和vue等热门前端框架进行了支持，
如果你想使用vue，你可以这样创建app：

```
bun init vueapp
```
打开http://localhost:8000/myapp/ 即可看到示例页面

我们还对vue做了ssr支持，你需要创建一个新的vueappssr：
```
bun init vueappssr
```
你还需要引入一个ssr插件：
```
npm i --save bun-vuessr-plugin
```
然后在conf/plugins.js中做好声明即可使用：

```
exports.SSR = {
  enable: true,
  package: 'bun-vuessr-plugin'
};
```
插件的具体使用方法请移步这里：https://github.com/bunjs/bun-vuessr-plugin

### react
如果你想使用react，你可以这样创建app：

```
bun init reactapp
```
打开http://localhost:8000/myapp/ 即可看到示例页面

我们还对react做了ssr支持，
针对react，你不需要创建ssrapp，只需安装一个插件，你可以很方便在project目录下安装插件：

```
npm i --save bun-reactssr-plugin
```
然后在conf/plugins.js中做好声明即可使用：

```
exports.SSR = {
  enable: true,
  package: 'bun-reactssr-plugin'
};
```
插件的具体使用方法请移步这里：https://github.com/bunjs/bun-reactssr-plugin

## 非bunjs框架使用
### 打包
1.在本地创建config.js文件，填入代码：
```javascript

module.exports = {
	appname: 'webapp',
    dirname: __dirname,
    isbun: false,// 标识是否是bunjs项目
    ssr: false,
    entry: {
        index: './src/entry/index.js',
    },
    serverEntry: '',// 如果需要服务端渲染，这里是给服务端的入口
    output: './build/static',
    template: './src/index.html',
    localStaticDomain: '/',
    publicStaticDomain: 'https://www.baidu.com/',
    testStaticDomain: '/static/',
    manifest: true,

    /**
     * 分离模式
     * commons 是否需要提取公共文件（2次以上引入，仅限js）优先级低于commons
     * vendors 是否需要提取node_modules中的模块（包含css） 优先级低于libs
     * libs
     */
    cacheGroups: ['vendors', 'commons'],
    libs: [], // 需要额外打包的公共库
    uglifyJs: true, // 开发模式下无效
    optimizeCSS: true, // 开发模式下无效
    supportFileType: ['vue', 'less', 'pug'], // 需要支持的文件格式
    globalPath: {
        '@': './src',
    },
    definePlugin: {
        prod: {
            // 是否为生产环境
            PRODUCTION: JSON.stringify(true),
        },
        dev: {
            // 是否为生产环境
            PRODUCTION: JSON.stringify(false),
        },
    },
    globalStyle: ['./src/resource/style/public.less'],
    // configureWebpack: config => require('vux-loader').merge(config, require('./webpackConfig/vuxLoader.config.js')),
    dev: {
        port: '8011',
        autoOpenBrowser: true,
        openUrlPath: '/kwaitask/intro',
        proxyTable: {},
        assetsPublicPath: '/',
        assetsSubDirectory: 'static',
        mockDir: './mock',
    },
};

```
2.然后执行：
```
bun release
```
打包后的文件就会出现在build目录下。
### mock
如果你想使用mock服务。
你需要先在config.js里配置好dev，和mock路径：
```
dev: {
    port: '8011',// 端口号
    autoOpenBrowser: true,// 是否自动打开浏览器
    openUrlPath: '/myapp',// 自动打开的页面地址
    proxyTable: {},// 代理
    assetsPublicPath: '/',// mock服务静态文件地址
    assetsSubDirectory: 'static',// mock服务静态文件夹名称
    mockDir: './mock',// mock数据的路径
},
```
然后执行：
```
bun rundev
```
打开http://localhost:8000/myapp/即可