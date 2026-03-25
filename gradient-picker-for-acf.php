<?php
/**
 * Plugin Name: Gradient Picker for ACF
 * Plugin URI:  https://github.com/jefferykarbowski/gradient-picker-for-acf
 * Description: Adds a visual gradient picker field type to Advanced Custom Fields. Build CSS gradients with an interactive UI.
 * Version:     1.0.0
 * Author:      Jeffery Karbowski
 * Author URI:  https://h3vt.com
 * License:     GPL-2.0+
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: gradient-picker-for-acf
 * Requires at least: 6.0
 * Requires PHP: 7.2
 *
 * @package Gradient_Picker_For_ACF
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'GPFA_VERSION', '1.0.0' );
define( 'GPFA_PATH', plugin_dir_path( __FILE__ ) );
define( 'GPFA_URL', plugin_dir_url( __FILE__ ) );

// Load text domain.
add_action( 'init', function () {
	load_plugin_textdomain( 'gradient-picker-for-acf', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
} );

// Admin notice if ACF is not active.
add_action( 'admin_notices', function () {
	if ( class_exists( 'ACF' ) ) {
		return;
	}
	printf(
		'<div class="notice notice-error"><p>%s</p></div>',
		esc_html__( 'Gradient Picker for ACF requires Advanced Custom Fields 6.0 or later.', 'gradient-picker-for-acf' )
	);
} );

// Register field type with ACF.
add_action( 'acf/include_field_types', function () {
	require_once GPFA_PATH . 'includes/class-gpfa-field.php';
	acf_register_field_type( 'GPFA_Field' );
} );

// Load helper functions.
require_once GPFA_PATH . 'includes/helpers.php';
