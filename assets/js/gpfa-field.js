(function($) {
    'use strict';

    /**
     * Check if a string is a CSS gradient direction.
     *
     * @param {string} str The string to test.
     * @return {boolean} True if the string is a direction keyword or angle.
     */
    function isDirection(str) {
        str = str.trim();

        if (/^\d+(\.\d+)?deg$/.test(str)) {
            return true;
        }

        if (/^to\s+(top|bottom|left|right)(\s+(top|bottom|left|right))?$/.test(str)) {
            return true;
        }

        return false;
    }

    /**
     * Parse a CSS linear-gradient string into its components.
     *
     * @param {string} value A CSS linear-gradient value.
     * @return {Object|null} Parsed object with direction and stops, or null on failure.
     */
    function parseLinearGradient(value) {
        if (!value || typeof value !== 'string') {
            return null;
        }

        var match = value.match(/^linear-gradient\((.+)\)$/i);
        if (!match) {
            return null;
        }

        var content = match[1].trim();

        // Split by commas that are not inside parentheses.
        var parts = [];
        var current = '';
        var depth = 0;
        var i;

        for (i = 0; i < content.length; i++) {
            var ch = content[i];
            if (ch === '(') {
                depth++;
                current += ch;
            } else if (ch === ')') {
                depth--;
                current += ch;
            } else if (ch === ',' && depth === 0) {
                parts.push(current.trim());
                current = '';
            } else {
                current += ch;
            }
        }

        if (current.trim()) {
            parts.push(current.trim());
        }

        if (parts.length < 2) {
            return null;
        }

        var direction = null;
        var stopParts = parts;

        if (isDirection(parts[0])) {
            direction = parts[0].trim();
            stopParts = parts.slice(1);
        }

        var stops = [];
        for (i = 0; i < stopParts.length; i++) {
            var part = stopParts[i].trim();
            var posMatch = part.match(/^(.+?)\s+(\d+(?:\.\d+)?)%$/);
            if (posMatch) {
                stops.push({
                    color: posMatch[1].trim(),
                    position: parseFloat(posMatch[2])
                });
            } else {
                // Color without explicit position — skip or treat as color-only.
                stops.push({
                    color: part,
                    position: null
                });
            }
        }

        if (stops.length === 0) {
            return null;
        }

        return {
            direction: direction,
            stops: stops
        };
    }

    /**
     * Map direction keywords to their equivalent degree values.
     */
    var directionToDeg = {
        'to top':          '0deg',
        'to right':        '90deg',
        'to bottom':       '180deg',
        'to left':         '270deg',
        'to top right':    '45deg',
        'to top left':     '315deg',
        'to bottom right': '135deg',
        'to bottom left':  '225deg'
    };

    /**
     * Map degree values back to direction keywords.
     */
    var degToDirection = {};
    (function() {
        var key;
        for (key in directionToDeg) {
            if (directionToDeg.hasOwnProperty(key)) {
                degToDirection[directionToDeg[key]] = key;
            }
        }
    })();

    /**
     * Initialize a single gradient picker field.
     *
     * @param {Element} el The .gpfa-field container element.
     */
    function initGradientField(el) {
        var input       = el.querySelector('.gpfa-value');
        var bar         = el.querySelector('.gpfa-gradient-bar');
        var direction   = el.querySelector('.gpfa-direction');
        var customAngle = el.querySelector('.gpfa-custom-angle');
        var angleSuffix = el.querySelector('.gpfa-angle-suffix');
        var preview     = el.querySelector('.gpfa-preview');

        if (!input || !bar || !direction) {
            return;
        }

        var gp = new Grapick({
            el: bar,
            height: '40px',
            width: '100%'
        });

        gp.setColorPicker(function(handler) {
            var handlerEl = handler.getEl();
            var colorContainer = handlerEl.querySelector('[data-toggle="handler-color-c"]');

            if (!colorContainer) {
                return;
            }

            // Hide the built-in color input.
            var colorWrap = handlerEl.querySelector('[data-toggle="handler-color-wrap"]');
            if (colorWrap) {
                colorWrap.style.display = 'none';
            }

            var pickerInput = document.createElement('input');
            pickerInput.type = 'text';
            pickerInput.value = handler.getColor();
            colorContainer.appendChild(pickerInput);

            $(pickerInput).wpColorPicker({
                color: handler.getColor(),
                alphaEnabled: true,
                change: function(event, ui) {
                    var color = ui.color.toString();
                    handler.setColor(color);
                },
                clear: function() {
                    handler.setColor('transparent');
                }
            });
        });

        /**
         * Build the gradient CSS value and update the hidden input and preview.
         */
        function updateValue() {
            if (gp.getHandlers().length === 0) {
                input.value = '';
                if (preview) {
                    preview.textContent = '';
                }
                return;
            }

            var dir = direction.value;

            if (dir === 'custom') {
                var angle = customAngle ? customAngle.value : '0';
                dir = angle + 'deg';
            }

            var val = 'linear-gradient(' + dir + ', ' + gp.getSafeValue() + ')';
            input.value = val;

            if (preview) {
                preview.textContent = val;
            }

            $(input).trigger('input');
        }

        // Parse existing value and populate controls.
        var existingValue = input.value;
        var parsed = parseLinearGradient(existingValue);

        if (parsed) {
            // Determine which direction option to select.
            var parsedDir = parsed.direction;

            if (parsedDir) {
                // Check if the parsed direction matches a preset option.
                var matchedPreset = false;

                // If it's a degree value, see if it maps to a keyword direction.
                if (degToDirection[parsedDir]) {
                    var keyword = degToDirection[parsedDir];
                    var options = direction.querySelectorAll('option');
                    var j;
                    for (j = 0; j < options.length; j++) {
                        if (options[j].value === keyword) {
                            direction.value = keyword;
                            matchedPreset = true;
                            break;
                        }
                    }
                }

                if (!matchedPreset) {
                    // Try direct match (e.g., "to right").
                    var options2 = direction.querySelectorAll('option');
                    var k;
                    for (k = 0; k < options2.length; k++) {
                        if (options2[k].value === parsedDir) {
                            direction.value = parsedDir;
                            matchedPreset = true;
                            break;
                        }
                    }
                }

                if (!matchedPreset) {
                    // It's a custom angle not in the preset list.
                    direction.value = 'custom';
                    if (customAngle) {
                        customAngle.value = parseInt(parsedDir, 10);
                        customAngle.style.display = '';
                    }
                    if (angleSuffix) {
                        angleSuffix.style.display = '';
                    }
                }
            }

            // Add parsed stops.
            var s;
            for (s = 0; s < parsed.stops.length; s++) {
                var stop = parsed.stops[s];
                var pos = stop.position !== null ? stop.position : Math.round((s / Math.max(parsed.stops.length - 1, 1)) * 100);
                gp.addHandler(pos, stop.color);
            }
        } else {
            // No value or parsing failed — add default stops.
            gp.addHandler(0, '#ffffff');
            gp.addHandler(100, '#000000');
        }

        // Direction select change handler.
        $(direction).on('change', function() {
            if (direction.value === 'custom') {
                if (customAngle) {
                    customAngle.style.display = '';
                }
                if (angleSuffix) {
                    angleSuffix.style.display = '';
                }
            } else {
                if (customAngle) {
                    customAngle.style.display = 'none';
                }
                if (angleSuffix) {
                    angleSuffix.style.display = 'none';
                }
            }
            updateValue();
        });

        // Custom angle input change handler.
        if (customAngle) {
            $(customAngle).on('change input', function() {
                updateValue();
            });
        }

        // Grapick change handler.
        gp.on('change', updateValue);

        // Initialize value on load.
        updateValue();
    }

    /**
     * Find and initialize all uninitialized gradient fields.
     */
    function initAll() {
        var fields = document.querySelectorAll('.gpfa-field:not(.gpfa-initialized)');
        var i;
        for (i = 0; i < fields.length; i++) {
            fields[i].classList.add('gpfa-initialized');
            initGradientField(fields[i]);
        }
    }

    acf.addAction('ready', initAll);
    acf.addAction('append', initAll);

})(jQuery);
