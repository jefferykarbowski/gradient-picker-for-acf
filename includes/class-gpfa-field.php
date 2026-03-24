<?php
/**
 * ACF Gradient field type.
 *
 * @package Gradient_Picker_For_ACF
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * GPFA_Field class.
 *
 * Provides a gradient picker field type for Advanced Custom Fields.
 */
class GPFA_Field extends acf_field {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->name     = 'gradient';
		$this->label    = __( 'Gradient', 'gradient-picker-for-acf' );
		$this->category = 'basic';
		$this->defaults = array(
			'default_value' => '',
		);
		$this->supports = array(
			'escaping_html' => true,
		);
		parent::__construct();
	}

	/**
	 * Render field settings in the ACF field group editor.
	 *
	 * @param array $field The field settings array.
	 */
	public function render_field_settings( $field ) {
		acf_render_field_setting(
			$field,
			array(
				'label'        => __( 'Default Value', 'gradient-picker-for-acf' ),
				'instructions' => __( 'Enter a CSS gradient value e.g. linear-gradient(90deg, #ff6b00 0%, #000000 100%)', 'gradient-picker-for-acf' ),
				'type'         => 'text',
				'name'         => 'default_value',
			)
		);
	}

	/**
	 * Render the field input in the post editor.
	 *
	 * @param array $field The field settings array.
	 */
	public function render_field( $field ) {
		?>
		<div class="gpfa-field">
			<input type="hidden" name="<?php echo esc_attr( $field['name'] ); ?>" value="<?php echo esc_attr( $field['value'] ); ?>" class="gpfa-value">
			<div class="gpfa-gradient-bar"></div>
			<div class="gpfa-controls">
				<select class="gpfa-direction">
					<option value="to right"><?php echo esc_html__( 'To Right', 'gradient-picker-for-acf' ); ?></option>
					<option value="to left"><?php echo esc_html__( 'To Left', 'gradient-picker-for-acf' ); ?></option>
					<option value="to bottom"><?php echo esc_html__( 'To Bottom', 'gradient-picker-for-acf' ); ?></option>
					<option value="to top"><?php echo esc_html__( 'To Top', 'gradient-picker-for-acf' ); ?></option>
					<option value="to top right"><?php echo esc_html__( 'To Top Right', 'gradient-picker-for-acf' ); ?></option>
					<option value="to bottom right"><?php echo esc_html__( 'To Bottom Right', 'gradient-picker-for-acf' ); ?></option>
					<option value="to bottom left"><?php echo esc_html__( 'To Bottom Left', 'gradient-picker-for-acf' ); ?></option>
					<option value="to top left"><?php echo esc_html__( 'To Top Left', 'gradient-picker-for-acf' ); ?></option>
					<option value="45deg">45&deg;</option>
					<option value="90deg">90&deg;</option>
					<option value="135deg">135&deg;</option>
					<option value="180deg">180&deg;</option>
					<option value="custom"><?php echo esc_html__( 'Custom Angle', 'gradient-picker-for-acf' ); ?></option>
				</select>
				<input type="number" class="gpfa-custom-angle" min="0" max="360" step="1" placeholder="deg" style="display:none;width:70px;">
				<span class="gpfa-angle-suffix" style="display:none;">deg</span>
			</div>
			<code class="gpfa-preview"><?php echo esc_html( $field['value'] ); ?></code>
		</div>
		<?php
	}

	/**
	 * Enqueue admin scripts and styles for the field.
	 */
	public function input_admin_enqueue_scripts() {
		// Styles.
		wp_enqueue_style( 'wp-color-picker' );
		wp_enqueue_style( 'gpfa-grapick', GPFA_URL . 'assets/vendor/grapick.min.css', array(), GPFA_VERSION );
		wp_enqueue_style( 'gpfa-field', GPFA_URL . 'assets/css/gpfa-field.css', array( 'gpfa-grapick', 'wp-color-picker' ), GPFA_VERSION );

		// Scripts.
		wp_enqueue_script( 'gpfa-wp-color-picker-alpha', GPFA_URL . 'assets/vendor/wp-color-picker-alpha.min.js', array( 'wp-color-picker' ), GPFA_VERSION, true );
		wp_enqueue_script( 'gpfa-grapick', GPFA_URL . 'assets/vendor/grapick.min.js', array(), GPFA_VERSION, true );
		wp_enqueue_script( 'gpfa-field', GPFA_URL . 'assets/js/gpfa-field.js', array( 'gpfa-grapick', 'gpfa-wp-color-picker-alpha', 'acf-input' ), GPFA_VERSION, true );
	}

	/**
	 * Sanitize and validate the field value before saving.
	 *
	 * @param string $value   The value to sanitize.
	 * @param int    $post_id The post ID where the value is saved.
	 * @param array  $field   The field settings array.
	 * @return string Sanitized gradient value or empty string.
	 */
	public function update_value( $value, $post_id, $field ) {
		$value = sanitize_text_field( $value );

		if ( '' === $value ) {
			return '';
		}

		// Strict regex whitelist for linear-gradient.
		$pattern = '/^linear-gradient\(\s*(to\s+(top|bottom|left|right)(\s+(top|bottom|left|right))?|\d{1,3}(\.\d+)?deg)\s*,(\s*(#[0-9a-fA-F]{3,8}|rgba?\(\s*[\d.\s,%\/]+\)|hsla?\(\s*[\d.\s,%\/]+\)|[a-z]+)\s+\d{1,3}(\.\d+)?%\s*,?)+\s*\)$/i';

		if ( ! preg_match( $pattern, $value ) ) {
			return '';
		}

		return $value;
	}

	/**
	 * Format the value for front-end output.
	 *
	 * @param string $value   The field value.
	 * @param int    $post_id The post ID.
	 * @param array  $field   The field settings array.
	 * @return string Escaped gradient value or empty string.
	 */
	public function format_value( $value, $post_id, $field ) {
		return $value ? esc_attr( $value ) : '';
	}
}
