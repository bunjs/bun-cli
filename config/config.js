module.exports = {
	webpackCopyConf: (appname) => {
		return {
			'./server': `./build/server/${appname}/`,
			'./conf': `./build/conf/${appname}/`,
			'./src/template': `./build/template/${appname}/`,
			// './src/static': `./build/static/${appname}/`,
			// './src': `./build/src/${appname}/`
		}
	},
	deployConf: {
		fileMap: (projectPath) => {
			return {
                './build/server/': `${projectPath}/app/`,
                './build/conf/': `${projectPath}/conf/`,
                './build/static/': `${projectPath}/static/`,
                './build/template/': `${projectPath}/template/`,
                // './build/src/': `${projectPath}/src/`
            };
		}
	},
	project: {
		downloadPath: 'bunjs/bun-project',
		fileMap: (appName) => {
			return [
                `${appName}/ecosystem.config.js`,	
                `${appName}/package.json`
            ];
		}
	},
	app: {
		downloadPath: 'bunjs/bun-app',
		fileMap: (appName) => {
			return [
                `${appName}/config.js`,
                `${appName}/package.json`,
                `${appName}/server/action/api/Api.js`,
                `${appName}/server/action/show/Home.js`,
                `${appName}/server/controller/Main.js`
            ];
		}
	},
	reactapp: {
		downloadPath: 'bunjs/bun-reactapp',
		fileMap: (appName) => {
			return [
                `${appName}/config.js`,
                `${appName}/package.json`,
                `${appName}/src/app/page/home/home.jsx`,
                `${appName}/src/app/page/pageone/pageone.jsx`,
                `${appName}/src/app/base/index.js`,
                `${appName}/server/action/show/Example.js`,
                `${appName}/server/action/api/Api.js`,
                `${appName}/server/controller/Main.js`,
                `${appName}/server/model/services/DataStation.js`,
                `${appName}/server/model/services/page/ExampleHomeShow.js`,
                `${appName}/server/model/services/page/ExampleOneShow.js`
            ];
		}
	},
	vueapp: {
		downloadPath: 'bunjs/bun-vueapp',
		fileMap: (appName) => {
			return [
                `${appName}/config.js`,
                `${appName}/package.json`,
                `${appName}/server/action/show/Example.js`,
                `${appName}/server/action/api/Api.js`,
                `${appName}/server/controller/Main.js`,
                `${appName}/server/model/services/DataStation.js`,
                `${appName}/server/model/services/page/ExampleHomeShow.js`,
                `${appName}/server/model/services/page/ExampleOneShow.js`
            ];
		}
	},
	vueappssr: {
		downloadPath: 'bunjs/bun-vueapp-ssr',
		fileMap: (appName) => {
			return [
                `${appName}/config.js`,
                `${appName}/package.json`,
                `${appName}/src/app/base/routes.js`,
                `${appName}/src/app/page/home/index.vue`,
                `${appName}/src/app/page/two/index.vue`,
                `${appName}/server/action/show/Example.js`,
                `${appName}/server/action/api/Api.js`,
                `${appName}/server/common/BasePage.js`,
                `${appName}/server/controller/Main.js`,
                `${appName}/server/model/services/DataStation.js`,
                `${appName}/server/model/services/page/ExampleHomeShow.js`,
                `${appName}/server/model/services/page/ExampleOneShow.js`
            ];
		}
	},
}