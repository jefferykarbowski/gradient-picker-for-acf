(function($) {
    'use strict';

    /**
     * Check if a string is a CSS gradient direction.
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
     * Initialize a single gradient picker field.
     */
    function initGradientField(el) {
        var input       = el.querySelector('.gpfa-value');
        var bar         = el.querySelector('.gpfa-gradient-bar');
        var dirSelect   = el.querySelector('.gpfa-direction');
        var customAngle = el.querySelector('.gpfa-custom-angle');
        var angleSuffix = el.querySelector('.gpfa-angle-suffix');
        var preview     = el.querySelector('.gpfa-preview');

        if (!input || !bar || !dirSelect) {
            return;
        }

        // Create a color picker container that sits below the gradient bar.
        var pickerWrap = document.createElement('div');
        pickerWrap.className = 'gpfa-color-picker-wrap';
        pickerWrap.style.display = 'none';
        bar.parentNode.insertBefore(pickerWrap, bar.nextSibling);

        var pickerInput = document.createElement('input');
        pickerInput.type = 'text';
        pickerInput.className = 'gpfa-color-input';
        pickerWrap.appendChild(pickerInput);

        // Set jQuery data directly — wp-color-picker-alpha reads these
        // via .data() which may miss raw DOM attributes on new elements.
        var $pickerInput = $(pickerInput);
        $pickerInput.data('alphaEnabled', true);
        $pickerInput.data('type', 'full');
        $pickerInput.data('alphaColorType', 'rgba');

        var activeHandler = null;
        var pickerReady = false;

        var gp = new Grapick({
            el: bar,
            height: '40px',
            width: '100%'
        });

        // Disable Grapick's built-in color picker entirely.
        gp.setColorPicker(function() {
            // Return nothing — we handle color picking externally.
        });

        // Initialize wp-color-picker on our external input.
        $pickerInput.wpColorPicker({
            type: 'full',
            change: function(event, ui) {
                if (activeHandler) {
                    var color = ui.color.toString();
                    // If alpha shim is active, use to_s for rgba output.
                    if (ui.color.to_s) {
                        color = ui.color.to_s('rgba');
                    }
                    activeHandler.setColor(color);
                }
            },
            clear: function() {
                if (activeHandler) {
                    activeHandler.setColor('transparent');
                }
            }
        });
        pickerReady = true;

        // When a handler is selected, show the color picker with its color.
        gp.on('handler:select', function(handler) {
            activeHandler = handler;
            pickerWrap.style.display = '';

            if (pickerReady) {
                $(pickerInput).wpColorPicker('color', handler.getColor());
            }
        });

        // When a handler is deselected, hide the picker.
        gp.on('handler:deselect', function() {
            activeHandler = null;
            pickerWrap.style.display = 'none';
        });

        // When a handler is removed, hide the picker if it was the active one.
        gp.on('handler:remove', function(removed) {
            if (activeHandler === removed) {
                activeHandler = null;
                pickerWrap.style.display = 'none';
            }
        });

        /**
         * Build the gradient CSS value and sync to hidden input.
         */
        function updateValue() {
            if (gp.getHandlers().length === 0) {
                input.value = '';
                if (preview) {
                    preview.textContent = '';
                }
                return;
            }

            var dir = dirSelect.value;
            if (dir === 'custom') {
                var angle = customAngle ? customAngle.value : '0';
                dir = angle + 'deg';
            }

            var val = 'linear-gradient(' + dir + ', ' + gp.getColorValue() + ')';
            input.value = val;

            if (preview) {
                preview.textContent = val;
            }

            $(input).trigger('input');
        }

        // Parse existing value and populate.
        var existingValue = input.value;
        var parsed = parseLinearGradient(existingValue);

        if (parsed) {
            var parsedDir = parsed.direction;

            if (parsedDir) {
                var matchedPreset = false;
                var options = dirSelect.querySelectorAll('option');
                var j;

                for (j = 0; j < options.length; j++) {
                    if (options[j].value === parsedDir) {
                        dirSelect.value = parsedDir;
                        matchedPreset = true;
                        break;
                    }
                }

                if (!matchedPreset) {
                    // Check if it's an angle matching a keyword.
                    var keywordMap = {
                        '0deg': 'to top', '90deg': 'to right', '180deg': 'to bottom', '270deg': 'to left',
                        '45deg': 'to top right', '135deg': 'to bottom right', '225deg': 'to bottom left', '315deg': 'to top left'
                    };
                    if (keywordMap[parsedDir]) {
                        for (j = 0; j < options.length; j++) {
                            if (options[j].value === keywordMap[parsedDir]) {
                                dirSelect.value = keywordMap[parsedDir];
                                matchedPreset = true;
                                break;
                            }
                        }
                    }
                }

                if (!matchedPreset) {
                    dirSelect.value = 'custom';
                    if (customAngle) {
                        customAngle.value = parseInt(parsedDir, 10);
                        customAngle.style.display = '';
                    }
                    if (angleSuffix) {
                        angleSuffix.style.display = '';
                    }
                }
            }

            var s;
            for (s = 0; s < parsed.stops.length; s++) {
                var stop = parsed.stops[s];
                var pos = stop.position !== null ? stop.position : Math.round((s / Math.max(parsed.stops.length - 1, 1)) * 100);
                gp.addHandler(pos, stop.color, 0);
            }
        } else if (existingValue && existingValue.charAt(0) === '#') {
            // Plain color value (backward compat) — create a solid gradient.
            gp.addHandler(0, existingValue, 0);
            gp.addHandler(100, existingValue, 0);
        } else {
            gp.addHandler(0, '#ffffff', 0);
            gp.addHandler(100, '#000000', 0);
        }

        // Direction controls.
        $(dirSelect).on('change', function() {
            if (dirSelect.value === 'custom') {
                if (customAngle) { customAngle.style.display = ''; }
                if (angleSuffix) { angleSuffix.style.display = ''; }
            } else {
                if (customAngle) { customAngle.style.display = 'none'; }
                if (angleSuffix) { angleSuffix.style.display = 'none'; }
            }
            updateValue();
        });

        if (customAngle) {
            $(customAngle).on('change input', function() {
                updateValue();
            });
        }

        gp.on('change', updateValue);

        // Initial value sync.
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
