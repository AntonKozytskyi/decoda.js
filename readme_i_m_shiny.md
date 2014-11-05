# Decoda v1.3.1 #

A lightweight textarea editor with toolbar functionality for the Decoda markup language.

## Requirements ##

jQuery 1.10.2

Browsers
* Tests in progress

## Contributors ##

* "Fugue" icons by Yusuke Kamiyamane - http://p.yusukekamiyamane.com/

## Features ##

A full list of Decoda tags, features and functionality can be found here: https://github.com/milesj/decoda

## Options list ##
* **open** : start of a tag, defaults to *[*
* **close** : end of a tag, defaults to *]*
* **namespace** : supplementary class applied to the editor, defaults to *none*
* **previewUrl** : URL to which are performed AJAX calls for preview of content, defaults to *none*
* **maxNewLines** : How many empty new lines can you have in a row at maximum, during the clean operation, defaults to *3*
* **submitFullFormOnPreview** : Do we submit the full form on preview, or only submit the textarea through the 'input' key, defaults to *false*
* **onSubmit** : callback to be called on the form submit, defaults to *none*
* **onInsert** : callback to be called on a tag insert, defaults to *none*
* **onRenderToolbar** : callback to be called when rendering a toolbar (usually through addFilters/addControls commands), defaults to *none*
* **onRenderPreview** : callback to be called when the preview button is clicked, defaults to *none*
* **onRenderHelp** : callback to be called when the help button is clicked, defaults to *none*

## Documentation ##

Instantiate the editor on a textarea element. Call `defaults()` to enable all toolbar functionality.

```javascript
$(document).ready(function(){
  $('#textarea').Decoda().defaults();
});
```

Or apply individual toolbars.

```javascript
$(document).ready(function(){
  $('#textarea').Decoda()
    .addFilters('default', $.Decoda.filters.defaults)
    .addFilters('block', $.Decoda.filters.block)
    .addFilters('text', $.Decoda.filters.text)
    .addControls('editor', $.Decoda.controls.editor);
});
```

Or define custom toolbars, or modify existing ones.

```javascript
$(document).ready(function(){
  $.Decoda.filters.custom = {
    audio: {
      tag: 'audio',
      title: 'Audio'
    }
  };

  $.Decoda.controls.editor.preview.onClick = function(command, button) {
    // Custom logic
  };

  $('#textarea').Decoda()
    .addFilters('custom', $.Decoda.filters.custom)
    .addControls('editor', $.Decoda.controls.editor);
});
```

The following callbacks can be defined through the constructor: `initialize`, `submit`, `insert`, `renderToolbar`, `renderPreview`, `renderHelp`.
As well as these options: `open`, `close`, `namespace`, `previewUrl`, `maxNewLines`.

```javascript
$(document).ready(function(){
    $('#textarea').Decoda({
        previewUrl: '/ajax/preview',
        onInitialize: function() {
            // Do nothing
        }
    }).defaults();
});
```