# Decoda v1.3.1 #

A lightweight textarea editor with toolbar functionality for the Decoda markup language.

## Requirements ##

* jQuery 1.10.2+ (no issue detected with version 1.11.1/2.1.1, may be compatible with previous versions)(http://jquery.com/)
* jQuery Rangy Inputs by Tim Down (https://github.com/timdown/rangyinputs)

Browsers compatibility test
* Chrome 38 Linux and Chrome 40-dev Windows
* Aurora 35 Windows (Firefox alpha channel)
* Opera 26-beta
* Internet Explorer 10 (IE 8/9 should be OK provided you use jQuery v1. major (support dropped in 2. branch) and don't rely on an enctype of multipart/form-data and FormData)
* Midori 0.4.6
* Epiphany 3.4.1 (without keyboard shortcuts support, as Epiphany does not seems to apply event bubbling for shortcuts when the key presses are one on its own shortcuts)
* Should work seamlessly on most WebKit based browsers to this point, and with jQuery capable browsers.
* Not working on Lynx, sorry about that.

## Contributors ##

* "Fugue" icons by Yusuke Kamiyamane - http://p.yusukekamiyamane.com/

## Features ##

A full list of Decoda tags, features and functionality can be found here: https://github.com/milesj/decoda

An online demo is available at http://decoda-demo.hegesippe.ovh/


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
  $('#textarea').decoda().defaults();
});
```

Or apply individual toolbars.

```javascript
$(document).ready(function(){
  $('#textarea').decoda()
    .addFilters('default', Decoda.filters.defaults)
    .addFilters('block', Decoda.filters.block)
    .addFilters('text', Decoda.filters.text)
    .addControls('editor', Decoda.controls.editor);
});
```

Or define custom toolbars, or modify existing ones.

```javascript
$(document).ready(function(){
  Decoda.filters.custom = {
    audio: {
      tag: 'audio',
      title: 'Audio'
    }
  };

  Decoda.controls.editor.preview.onClick = function(command, button) {
    // Custom logic
  };

  $('#textarea').decoda()
    .addFilters('custom', Decoda.filters.custom)
    .addControls('editor', Decoda.controls.editor);
});
```

The following callbacks can be defined through the constructor: `initialize`, `submit`, `insert`, `renderToolbar`, `renderPreview`, `renderHelp`.
As well as these options: `open`, `close`, `namespace`, `previewUrl`, `maxNewLines`.

```javascript
$(document).ready(function(){
    $('#textarea').decoda({
        previewUrl: '/ajax/preview',
        onInitialize: function() {
            // Do nothing
        }
    }).defaults();
});
```

You can delay the toolbar adding, as long as you keep the object we provide you at the beginning.

```javascript
$(document).ready(function(){
    //Just make sure not to use var here, or you lose the variable due to the function scope
    myDecodaTextareaObject = $('#textarea').decoda({
        previewUrl: '/ajax/preview',
        onInitialize: function() {
            alert('I am a perfectly serious individual.');
        }
    }).addFilters('block', Decoda.filters.block);
});

$(document).ready(function(){
  //Half a century later, in a galaxy far far away
  myDecodaTextareaObject.addFilters('text', Decoda.filters.text);
}
```

**Those methods are not recommended, and may provide unexpected results :**

In case you want to add Decoda on multiple elements via a jQuery selector, you will be provided with an indexed array of elements :
The key is the element id, if not found, one will be provided,
The value is the decoda object on which you can then call your methods as previously.

```javascript
$(document).ready(function(){
  var instances = $('.apply-decoda').decoda();
  instances['textarea-id-1'].addFilters('block', Decoda.filters.block);
});
```

It also accepts native arrays of elements if you add the $.fn.decoda function to Array.prototype. NodeList is not supported.