=== Gradient Picker for ACF ===
Contributors: jefferykarbowski
Tags: acf, gradient, color picker, css gradient, custom fields
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 7.2
Stable tag: 1.0.0
License: GPL-2.0+
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Adds a visual gradient picker field type to Advanced Custom Fields. Build CSS gradients with an interactive drag-and-drop UI.

== Description ==

Gradient Picker for ACF adds a new "Gradient" field type to Advanced Custom Fields (ACF 6.0+). It provides an intuitive visual interface for building CSS linear gradients directly in the WordPress admin.

**Features:**

* Interactive gradient bar — click to add color stops, drag to reposition
* Full color picker with alpha/opacity support for each stop
* Direction presets (to right, to bottom, 45deg, 90deg, etc.) plus custom angle input
* Stores a complete CSS gradient string ready for use in your templates
* Works in repeaters, flexible content, and the Gutenberg sidebar
* Lightweight — no external requests, all assets bundled

**Usage:**

After activation, you will find "Gradient" in the ACF field type list under the Basic category. Create a field, and use it in your templates:

`$gradient = get_field( 'my_gradient' );`
`echo '<div style="background: ' . esc_attr( $gradient ) . '"></div>';`

A helper function is included for parsing gradient values:

`$parsed = gpfa_parse_gradient( $gradient );`
`// Returns: array( 'type' => 'linear', 'direction' => '90deg', 'stops' => array( ... ) )`

**Requirements:**

* WordPress 6.0+
* Advanced Custom Fields 6.0+ (free or PRO)
* PHP 7.2+

== Installation ==

1. Upload the `gradient-picker-for-acf` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the Plugins menu in WordPress
3. Ensure Advanced Custom Fields 6.0+ is installed and active
4. Create or edit an ACF field group and add a "Gradient" field

== Frequently Asked Questions ==

= Does this work with ACF Free? =

Yes. This plugin works with both the free version of ACF (bundled with WordPress) and ACF PRO.

= What gradient types are supported? =

Version 1.0 supports linear gradients with unlimited color stops and customizable direction. Radial gradient support is planned for a future release.

= How is the gradient value stored? =

As a plain CSS gradient string in the database, e.g. `linear-gradient(90deg, #ff6b00 0%, #000000 100%)`. You can use it directly in inline styles or pass it to the included `gpfa_parse_gradient()` helper to extract individual colors and positions.

= Does it support alpha/transparency? =

Yes. Each color stop supports full RGBA color picking with an alpha slider.

== Screenshots ==

1. The gradient picker field in the post editor with color picker open
2. The gradient bar with multiple color stops and direction control

== Changelog ==

= 1.0.0 =
* Initial release
* Linear gradient support with unlimited color stops
* Direction presets and custom angle input
* Alpha/opacity support for color stops
* Helper function gpfa_parse_gradient() for parsing gradient values
* Compatible with ACF repeaters, flexible content, and Gutenberg sidebar
