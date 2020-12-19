const path = require('path')
/*
webpack 5
1) in production mode minifies code by default
2) target ["web", "es5"] should be specified to es5-output (for obsolete brosers)
   Without this webpack will generate es6-output
   Also it is reasonable to add polyfills for those browsers
3) sourse-map may be omitted in production mode
*/
module.exports = env => {
	
	const mode = env.production ? 'production' : 'development'

	return {
		mode: mode,
		entry: './index.jsx',
		output: {
			path: path.resolve(__dirname, './build'),
			filename: 'build.js' 
		},
		module: {
			rules: [
				{
					test: /\.jsx?$/,
					exclude: /node_modules/,
					loader: 'babel-loader',
					options: { 
						presets: ['env', 'react']
					}
				}
			]
		},
		devtool: 'source-map',
		target: ["web", "es5"],
		devServer: { historyApiFallback: true, publicPath: '/build' }
	}
}