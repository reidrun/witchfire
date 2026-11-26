<?php
/**
 * Plugin Name:       WitchFire
 * Description:       a wordpress block editor plugin for syntax highlighting code via Lumis
 * Version:           0.1.0
 * Requires at least: 6.8
 * Requires PHP:      8.5
 * Author:            Alex Barber
 * License:           GPL-3.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:       witchfire
 *
 * @package Reidrun
 */
declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
/**
 * Registers the block(s) metadata from the `blocks-manifest.php` and registers the block type(s)
 * based on the registered block metadata. Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://make.wordpress.org/core/2025/03/13/more-efficient-block-type-registration-in-6-8/
 * @see https://make.wordpress.org/core/2024/10/17/new-block-type-registration-apis-to-improve-performance-in-wordpress-6-7/
 */
function reidrun_witchfire_block_init(): void {
	wp_register_block_types_from_metadata_collection( __DIR__ . '/build', __DIR__ . '/build/blocks-manifest.php' );
}
add_action( 'init', 'reidrun_witchfire_block_init' );

function reidrun_witchfire_scan_wasm_source( array $source ): array {
	return ( glob( $source['dir'] . '/*.wasm' ) ?: [] )
		|> ( fn( array $files ): array => array_map( basename( ... ), $files ) )
		|> ( fn( array $names ): array => array_filter(
			$names,
			fn( string $name ) => $name !== 'web-tree-sitter.wasm'
		) )
		|> ( fn( array $names ): array => array_combine(
			array_map(
				fn( string $name ): string => preg_replace(
					'/^(?:tree-sitter-)?(.+)\.wasm$/',
					'$1',
					$name
				),
				$names
			),
			array_map( fn( string $name ): string => $source['url'] . '/' . $name, $names )
		) );
}

function reidrun_witchfire_get_languages(): array {
	$uploads = wp_upload_dir();
	$sources = [
		[
			'path' => plugin_dir_path( __FILE__ ) . 'build/wasm',
			'url' => plugin_dir_url( __FILE__ ) . 'build/wasm'
		],
		[
			'path' => $uploads['basedir'] . '/witchfire/wasm',
			'url' => $uploads['baseurl'] . '/witchfire/wasm'
		]
	];

	return $sources
		|> ( fn( array $s ): array => array_filter(
			$s,
			fn( array $source ): bool => is_dir( $source['dir'] )
		) )
		|> ( fn( array $s ): array => array_map(
			reidrun_witchfire_scan_wasm_source( ... ),
			$s
		) )
		|> ( fn( array $maps ): array => array_merge( ...$maps ) );
}

function reidrun_witchfire_enqueue_block_editor_assets(): void {
	wp_add_inline_script(
		'reidrun-witchfire-editor-script',
		'window.witchfireConfig = ' . wp_json_encode( [
			'runtimeWasmUrl' => plugin_dir_url( __FILE__ ) . 'build/wasm/web-tree-sitter.wasm',
			'languages' => reidrun_witchfire_get_languages()
		] ) . ';',
		'before'
	);
}
add_action( 'enqueue_block_editor_assets', 'reidrun_witchfire_enqueue_block_editor_assets' );
