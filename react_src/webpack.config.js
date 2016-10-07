var ExtractTextPlugin = require("extract-text-webpack-plugin");
var path = require('path');
console.log("current path:", path.resolve('./'));
module.exports = {
	entry:{
		'page':'./renderer.js'
	},
	output:{
		path: path.resolve('../')+'/build',
		publicPath: './bulid/',
		filename: "[name].js",
		chunkFilename:"[id].js"
	},
	resolve:{
		root:[
			//"/var/www/web_test/ally/WCK_WX",
			//process.env.NODE_PATH+"/../",
			path.resolve('./'),
			//path.resolve('./')+'/react_src'
		],
		extensions:['', '.js', '.css', '.jsx']
		//modulesDirectories:['components', 'node_modules']
		/*
		alias:{
			//components:__dirname + '/components'
			components: path.resolve('./components')
		}*/
	},
	module:{
		loaders: [
			/*	{
				test: /\.js?$/,
				loader: 'jsx-loader?harmony'
			},*/
			{
				test: /\.js?$/,
				exclude:/(node_modules|bower_components)/,
				loader: 'babel',
				query:{
					presets:['react', 'es2015']
				}
			},
			{
				test: /\.css$/,
				loader:ExtractTextPlugin.extract("style-loader", "css-loader")
			},
			{
				test: /\.less$/,
				loader:ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")
			},
			{
				test: /\.(png|jpg|jpeg|gif)\??.*$/,
				loader:'url-loader',
				query:{
					//name:"[path]/images/[name].[ext]",
					name:"images/[name].[ext]",
					limit:4000
				}
			},
			{
				test: /\.(ttf|woff|eot|svg)\??.*$/,
				loader: path.resolve('./') + '/tools/wck-loader',
				query:{
					name:"fonts/[name].[ext]",
					limit:4000,
					cache_flag:true
				}
			},
		]
	},
	plugins:[
		new ExtractTextPlugin("css/[name].css")
	]
};
