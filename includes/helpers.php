<?php
/**
 * Helper functions for Gradient Picker for ACF.
 *
 * @package Gradient_Picker_For_ACF
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Parse a CSS gradient string into its components.
 *
 * @param string $value CSS gradient value.
 * @return array|false Parsed gradient data or false on failure.
 */
function gpfa_parse_gradient( $value ) {
	if ( ! is_string( $value ) || ! preg_match( '/^linear-gradient\((.+)\)$/i', trim( $value ), $m ) ) {
		return false;
	}

	$inner = $m[1];

	/*
	 * Split by commas that are NOT inside parentheses.
	 * This handles rgb(), rgba(), hsl(), hsla() color values
	 * which contain commas themselves.
	 */
	$parts = array();
	$current = '';
	$depth   = 0;
	$len     = strlen( $inner );

	for ( $i = 0; $i < $len; $i++ ) {
		$ch = $inner[ $i ];
		if ( '(' === $ch ) {
			$depth++;
			$current .= $ch;
		} elseif ( ')' === $ch ) {
			$depth--;
			$current .= $ch;
		} elseif ( ',' === $ch && 0 === $depth ) {
			$parts[] = trim( $current );
			$current = '';
		} else {
			$current .= $ch;
		}
	}
	if ( '' !== trim( $current ) ) {
		$parts[] = trim( $current );
	}

	$direction = '180deg';
	$stops     = array();

	// Check if first part is a direction keyword or angle.
	if ( ! empty( $parts[0] ) && preg_match( '/^(to\s+\w+(\s+\w+)?|\d{1,3}(\.\d+)?deg)$/i', $parts[0] ) ) {
		$direction = array_shift( $parts );
	}

	foreach ( $parts as $part ) {
		$part = trim( $part );
		if ( preg_match( '/^(.+)\s+([\d.]+%?)$/', $part, $sm ) ) {
			$stops[] = array(
				'color'    => trim( $sm[1] ),
				'position' => $sm[2],
			);
		}
	}

	if ( empty( $stops ) ) {
		return false;
	}

	return array(
		'type'      => 'linear',
		'direction' => $direction,
		'stops'     => $stops,
	);
}
