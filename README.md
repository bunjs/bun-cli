# bun-cli
基于koa2的node框架--cli工具
##安装：

```
npm i -g bunjs
```
##使用：
构建项目工程框架：

```
bun init project
```
根据提示输入名称,如myProject。
然后cd进入新创建的project目录，执行：

```
npm install
```
一个项目工程构建完成。

然后退回到上一级目录，并创建一个新的app：

```
cd ..
bun init app
```
根据提示输入app名称,如myapp。
然后cd进入新创建的project目录，执行：

```
npm install
```
然后编译当前app内容到工程目录：

```
bun r -t ../myProject
```
开发环境下，可加上：
-d参数：使用开发模式打包编译（不会进行压缩等）
-w参数：实时监听文件修改，自动打包编译

然后，回到project目录，启动项目：

```
cd myProject
bun run myProject
```

工具内置了pm2作为进程保护，可以监听文件修改自动重新启动

默认端口是8000，打开http://localhost:8000/myapp/home 即可看到示例页面


