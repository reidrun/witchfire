import defaultConfig from '@wordpress/scripts/config/webpack.config.js';
import CopyPlugin from 'copy-webpack-plugin';
import * as path from "node:path";

const config = {
	...defaultConfig,
	plugins: [
		...defaultConfig.plugins,
		new CopyPlugin( {
			patterns: [
				{
					from: path.resolve( import.meta.dirname, 'node_modules/@lumis-sh/lumis/dist/web-tree-sitter.wasm' ),
					to: 'wasm/web-tree-sitter.wasm',
				},
				{
					from: path.resolve( import.meta.dirname, 'node_modules/@lumis-sh/wasm-*/**/*.wasm' ),
					to: 'wasm/[name][ext]',
					noErrorOnMissing: true,
				},
				{
					from: path.resolve( import.meta.dirname, 'node_modules/@lumis-sh/themes/**/*.css' ),
					to: 'themes/[name][ext]',
				},
			],
		} ),
	]
}

export default config;
