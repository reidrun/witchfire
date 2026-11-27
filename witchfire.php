<?php
/**
 * Plugin Name:       WitchFire
 * Description:       a wordpress block editor plugin for syntax highlighting code via Lumis
 * Version:           1.0.0
 * Requires at least: 6.8
 * Requires PHP:      7.3
 * Author:            Alex Barber
 * License:           GPL-3.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:       witchfire
 *
 * @package Reidrun
 */
declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function reidrun_witchfire_block_init(): void {
	wp_register_style(
		'reidrun-witchfire-lumis-theme',
		plugin_dir_url( __FILE__ ) . 'build/themes/monokai_pro_dark.css', // temporary, I still need to decide how users choose this
	);

	wp_register_block_types_from_metadata_collection( __DIR__ . '/build', __DIR__ . '/build/blocks-manifest.php' );
}

add_action( 'init', 'reidrun_witchfire_block_init' );
