# Decoda v1.3.0 #

A lightweight textarea editor with toolbar functionality for the Decoda markup language.

## Requirements ##

MooTools 1.4
* Core
* More/Element.Forms
* More/Element.Shortcuts

Browsers
* Chrome 9+
* Firefox 4+
* Safari 5.1+
* Opera 11+
* Internet Explorer 8+

## Contributors ##

* "Fugue" icons by Yusuke Kamiyamane - http://p.yusukekamiyamane.com/

## Features ##

A full list of Decoda tags, features and functionality can be found here: https://github.com/milesj/php-decoda

## Documentation ##

Instantiate the editor on a textarea element. Call `defaults()` to enable all toolbar functionality.

```javascript
window.addEvent('domready', function() {
    new Decoda('textarea').defaults();
});
```

Or apply individual toolbars.

```javascript
window.addEvent('domready', function() {
    new Decoda('textarea')
        .addFilters('default', Decoda.filters.defaults)
        .addFilters('block', Decoda.filters.block)
        .addFilters('text', Decoda.filters.text)
        .addControls('editor', Decoda.controls.editor);
});
```

Or define custom toolbars, or modify existing ones.

```javascript
window.addEvent('domready', function() {
    Decoda.filters.custom.audio = {
        tag: 'audio',
        title: 'Audio'
    };

    Decoda.controls.editor.preview.onClick = function(command, button) {
        // Custom logic
    };

    new Decoda('textarea')
        .addFilters('custom', Decoda.filters.custom)
        .addControls('editor', Decoda.controls.editor);
});
```

The following callbacks can be defined through the constructor: `initialize`, `submit`, `insert`, `renderToolbar`, `renderPreview`, `renderHelp`.
As well as these options: `open`, `close`, `namespace`, `previewUrl`, `maxNewLines`.

```javascript
window.addEvent('domready', function() {
    new Decoda('textarea', {
        previewUrl: '/ajax/preview',
        onInitialize: function() {
            // Do something
        }
    }).defaults();
});
```