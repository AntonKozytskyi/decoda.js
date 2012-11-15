/**
 * @author      Miles Johnson - http://milesj.me
 * @copyright   Copyright 2006-2012, Miles Johnson, Inc.
 * @license     http://opensource.org/licenses/mit-license.php - Licensed under The MIT License
 * @link        http://milesj.me/code/mootools/decoda
 */

/**
 * Creates a lightweight textarea editor with toolbar functionality for the Decoda markup language.
 *
 * @version	1.0.0-beta
 * @uses	MooTools/Core
 * @uses	MooTools/More/Element.Forms
 * @uses	MooTools/More/Element.Shortcuts
 */
var Decoda = new Class({
	Implements: [Events, Options],

	/**
	 * Wrapping parent.
	 */
	editor: null,

	/**
	 * Toolbar.
	 */
	toolbar: null,

	/**
	 * Textarea input.
	 */
	textarea: null,

	/**
	 * Textarea pane.
	 */
	container: null,

	/**
	 * Preview pane.
	 */
	preview: null,

	/**
	 * Help pane.
	 */
	help: null,

	/**
	 * Array of loaded tags.
	 */
	tags: [],

	/**
	 * Options.
	 */
	options: {
		open: '[',
		close: ']',
		namespace: '',
		previewUrl: '',
		onSubmit: null,
		onInsert: null,
		onRenderToolbar: null,
		onRenderPreview: null,
		onRenderHelp: null
	},

	/**
	 * Initialize the editor by wrapping the textarea and generating the toolbar.
	 *
	 * @param {String} id
	 * @param {Object} options
	 */
	initialize: function(id, options) {
		this.setOptions(options);
		this.textarea = $(id);

		if (!this.textarea) {
			throw new Error('Invalid textarea');
		}

		// Build toolbars
		this.editor = new Element('div.decoda-editor');
		this.toolbar = new Element('div.decoda-toolbars');
		this.container = new Element('div.decoda-textarea');
		this.preview = new Element('div.decoda-preview').hide();
		this.help = new Element('div.decoda-help').hide();

		this.container.wraps(this.textarea);
		this.editor
			.grab(this.toolbar)
			.wraps(this.container)
			.adopt([this.preview, this.help]);

		// Load defaults
		if (this.options.namespace) {
			this.editor.addClass(this.options.namespace);
		}

		// Add onSubmit event to the parent form
		if (this.$events.submit) {
			this.textarea.getParent('form').addEvent('submit', this.$events.submit[0].bind(this));
		}
	},

	/**
	 * Apply all filters and controls to the toolbar.
	 *
	 * @param {Array} blacklist
	 * @return {Decoda}
	 */
	defaults: function(blacklist) {
		this.addFilters(null, null, blacklist);
		this.addControls(null, null, blacklist);

		return this;
	},

	/**
	 * Add controls to the toolbar.
	 *
	 * @param {String} control
	 * @param {Array} commands
	 * @param {Array} blacklist
	 * @return {Decoda}
	 */
	addControls: function(control, commands, blacklist) {
		if (!commands) {
			Object.each(Decoda.controls, function(commands, control) {
				this.addControls(control, commands, blacklist);
			}.bind(this));

		} else {
			this.buildToolbar(control, commands, blacklist);
		}

		return this;
	},

	/**
	 * Add filters to the toolbar.
	 *
	 * @param {String} filter
	 * @param {Array} tags
	 * @param {Array} blacklist
	 * @return {Decoda}
	 */
	addFilters: function(filter, tags, blacklist) {
		if (!tags) {
			Object.each(Decoda.filters, function(tags, filter) {
				this.addFilters(filter, tags, blacklist);
			}.bind(this));

		} else {
			this.buildToolbar(filter, tags, blacklist);

			tags.each(function(tag) {
				this.tags.push(tag);
			}.bind(this));
		}

		return this;
	},

	/**
	 * Add commands to the toolbar.
	 *
	 * @param {String} id
	 * @param {Array} commands
	 * @param {Array} blacklist
	 * @return {Decoda}
	 */
	buildToolbar: function(id, commands, blacklist) {
		blacklist = Array.from(blacklist) || [];

		var ul = new Element('ul.decoda-toolbar').addClass('toolbar-' + id),
			li, button, menu, anchor;

		// Create menu using the commands
		commands.each(function(command) {
			if (blacklist.indexOf(command.tag) >= 0) {
				return;
			}

			li = new Element('li');

			// Create the button
			button = new Element('button.tag-' + command.tag, {
				html: '<span></span>',
				title: command.title,
				type: 'button'
			});

			button.addEvent('click', (command.onClick || this.insertTag).bind(this, command, button));

			if (command.className) {
				button.addClass(command.className);
			}

			li.grab(button);

			// Create sub-menu using options
			if (command.options) {
				menu = new Element('ul.decoda-menu').addClass('menu-' + command.tag);

				command.options.each(function(option) {
					option = Object.merge({}, command, option);

					if (blacklist.indexOf(option.tag) >= 0) {
						return;
					}

					anchor = new Element('a', {
						href: 'javascript:;',
						html: '<span></span>' + option.title,
						title: option.title
					});

					anchor.addEvent('click', (option.onClick || this.insertTag).bind(this, option, anchor));

					if (option.className) {
						anchor.addClass(option.className);
					}

					menu.grab(new Element('li').grab(anchor));
				}.bind(this));

				li.grab(menu);
			}

			ul.grab(li);
		}.bind(this));

		if (ul.hasChildNodes()) {
			this.toolbar.grab(ul);

			this.fireEvent('renderToolbar', ul);
		}

		return this;
	},

	/**
	 * Disable all the buttons and menus in the toolbar.
	 *
	 * @return {Decoda}
	 */
	disableToolbar: function() {
		this.toolbar.getElements('button').each(function(node) {
			node.set('disabled', true);
			node.getParent('li').addClass('disabled');
		});

		return this;
	},

	/**
	 * Enable all the buttons and menus in the toolbar.
	 *
	 * @return {Decoda}
	 */
	enableToolbar: function() {
		this.toolbar.getElements('button').each(function(node) {
			node.set('disabled', false);
			node.getParent('li').removeClass('disabled');
		});

		return this;
	},

	/**
	 * Clean the textarea input.
	 *
	 * @return {boolean}
	 */
	clean: function() {
		var value = String.from(this.textarea.get('value'));

		// Remove extraneous newlines
		value = value.replace(/\n{3,}/g, "\n\n");

		// Trim trailing whitespace
		value = value.trim();

		// Convert special characters
		value = value.tidy();

		this.textarea.set('value', value);

		return true;
	},

	/**
	 * Insert a tag into the textarea. If a prompt is defined, grab the value.
	 *
	 * @param {Object} tag
	 * @return {Decoda}
	 */
	insertTag: function(tag) {
		var selected,
			defaultValue,
			contentValue,
			field = tag.promptFor || 'default';

		// Grab a value from the prompt
		if (tag.prompt) {
			var answer = prompt(tag.prompt);

			// Exit if prompt is cancelled (null)
			if (answer === null) {
				return this;
			}

			// Trigger callback on the value
			if (typeOf(tag.onInsert) === 'function') {
	            answer = tag.onInsert(answer, field);
			}

			if (field === 'default') {
				defaultValue = answer;
			} else {
				contentValue = answer;
			}
		}

		// Text is selected
		var markup = this.formatTag(tag, defaultValue, contentValue),
			open = this.formatTag(tag, defaultValue, contentValue, 'open'),
			close = this.formatTag(tag, defaultValue, contentValue, 'close');

		if (selected = this.textarea.getSelectedText()) {
			if (tag.selfClose) {
				this.textarea.insertAtCursor(selected + markup);

			} else {
				this.textarea.insertAroundCursor({
					before: open,
					after: close,
					defaultMiddle: selected
				});
			}

		// Insert at cursor
		} else {
			this.textarea.insertAtCursor(markup, false);

			// Move the caret in between the tags
			if (!tag.selfClose) {
				this.textarea.setCaretPosition(this.textarea.getCaretPosition() - close.length);
			}
		}

		this.fireEvent('insert', markup);

		return this;
	},

	/**
	 * Format the output of a tag based on tag settings and values.
	 *
	 * @param {Object} tag
	 * @param {String} defaultValue
	 * @param {String} contentValue
	 * @param {String} type
	 * @return {String}
	 */
	formatTag: function(tag, defaultValue, contentValue, type) {
		defaultValue  = defaultValue || tag.defaultValue || '';
		contentValue = contentValue || tag.placeholder || '';

		var t = tag.tag,
			o = this.options.open,
			c = this.options.close,
			open = o + t,
			close = o + '/' + t + c;

		// Only append a default attribute if the value from a prompt is valid
		if (tag.hasDefault) {
			var field = tag.promptFor || 'default';

			if (tag.prompt && field === 'default') {
				if (defaultValue) {
					open += '="' + defaultValue + '"';
				}

			// Else always show an empty default attribute
			} else {
				open += '="' + defaultValue + '"';
			}
		}

		// If a self-closing tag, exit early
		if (tag.selfClose) {
			return open + '/' + c;
		} else {
			open += c;
		}

		// Return only open and closing tags
		if (type === 'open') {
			return open;

		} else if (type === 'close') {
			return close;
		}

		return open + contentValue + close;
	},

	/**
	 * Render a help / how-to table using the loaded tags.
	 */
	renderHelp: function() {
		var table = new Element('table'),
			thead = new Element('thead'),
			tbody = new Element('tbody'),
			tr,
			examples,
			attributes;

		// Create headers
		tr = new Element('tr');
		tr.grab(new Element('th', { text: 'Tag' }));
		tr.grab(new Element('th', { text: 'Attributes' }));
		tr.grab(new Element('th', { text: 'Examples' }));
		thead.grab(tr);

		// Create rows
		this.tags.each(function(tag) {
			attributes = (tag.attributes || []).join(', ');
			examples = (tag.examples || [ this.formatTag(tag) ]).join('<br>');

			tr = new Element('tr');
			tr.grab(new Element('td', { html: tag.title }).addClass('tag-title'));
			tr.grab(new Element('td', { html: attributes }).addClass('tag-attributes'));
			tr.grab(new Element('td', { html: examples }).addClass('tag-examples'));
			tbody.grab(tr);
		}.bind(this));

		table.adopt([thead, tbody]);
		this.help.grab(table);

		this.fireEvent('renderHelp', table);
	},

	/**
	 * Post an AJAX call to a URL that returns the parsed Decoda markup.
	 */
	renderPreview: function() {
		this.preview.addClass('loading');

		new Request({
			url: this.options.previewUrl,
			data: {
				input: this.textarea.get('value')
			},
			onSuccess: function(response) {
				this.preview.removeClass('loading').set('html', response);
			}.bind(this),
			onFailure: function() {
				this.container.show();
				this.enableToolbar();

				alert('An error has occurred while rendering the preview.');
			}.bind(this)
		}).post();

		this.fireEvent('renderPreview');
	}

});

/**
 * Collection of filters and controls.
 */
Decoda.filters = {};
Decoda.controls = {};

/**
 * Default standard tags.
 */
Decoda.filters.default =  [
	{ tag: 'b', title: 'Bold', key: 'b' },
	{ tag: 'i', title: 'Italics', key: 'i' },
	{ tag: 'u', title: 'Underline', key: 'u' },
	{ tag: 's', title: 'Strike-Through', key: 's' },
	{ tag: 'sub', title: 'Subscript' },
	{ tag: 'sup', title: 'Superscript' },
	{ tag: 'abbr', title: 'Abbreviation', hasDefault: true, attributes: ['default'] },
	{ tag: 'br', title: 'Line Break', selfClose: true },
	{ tag: 'hr', title: 'Horizontal Break', selfClose: true }
];

/**
 * Text and font related tags.
 */
Decoda.filters.text = [
	{
		tag: 'font',
		title: 'Font Family',
		prompt: 'Font:',
		hasDefault: true,
		attributes: ['default'],
		examples: ['[font="Arial"][/font]'],
		options: [
			{ title: 'Arial', defaultValue: 'Arial', className: 'font-arial', prompt: false },
			{ title: 'Tahoma', defaultValue: 'Tahoma', className: 'font-tahoma', prompt: false },
			{ title: 'Verdana', defaultValue: 'Verdana', className: 'font-verdana', prompt: false },
			{ title: 'Courier', defaultValue: 'Courier', className: 'font-courier', prompt: false },
			{ title: 'Times', defaultValue: 'Times', className: 'font-times', prompt: false },
			{ title: 'Helvetica', defaultValue: 'Helvetica', className: 'font-helvetica', prompt: false }
		]
	}, {
		tag: 'size',
		title: 'Text Size',
		prompt: 'Size:',
		hasDefault: true,
		attributes: ['default'],
		examples: ['[size="12"][/size]'],
		options: [
			{ title: 'Small', defaultValue: '10', className: 'size-small', prompt: false },
			{ title: 'Normal', defaultValue: '12', className: 'size-normal', prompt: false },
			{ title: 'Medium', defaultValue: '18', className: 'size-medium', prompt: false },
			{ title: 'Large', defaultValue: '24', className: 'size-large', prompt: false }
		],
		onInsert: function(value, field) {
			if (field === 'default') {
				return Number.from(value).limit(10, 29);
			}

			return value;
		}
	}, {
		tag: 'color',
		title: 'Text Color',
		prompt: 'Hex Code:',
		hasDefault: true,
		attributes: ['default'],
		examples: ['[color="red"][/color]'],
		options: [
			{ title: 'Yellow', defaultValue: 'yellow', className: 'color-yellow', prompt: false },
			{ title: 'Orange', defaultValue: 'orange', className: 'color-orange', prompt: false },
			{ title: 'Red', defaultValue: 'red', className: 'color-red', prompt: false },
			{ title: 'Blue', defaultValue: 'blue', className: 'color-blue', prompt: false },
			{ title: 'Purple', defaultValue: 'purple', className: 'color-purple', prompt: false },
			{ title: 'Green', defaultValue: 'green', className: 'color-green', prompt: false },
			{ title: 'White', defaultValue: 'white', className: 'color-white', prompt: false },
			{ title: 'Gray', defaultValue: 'gray', className: 'color-gray', prompt: false },
			{ title: 'Black', defaultValue: 'black', className: 'color-black', prompt: false }
		],
		onInsert: function(value, field) {
			if (field === 'default') {
				return /(?:#[0-9a-f]{3,6}|[a-z]+)/i.exec(value) ? value : null;
			}

			return value;
		}
	}, {
		tag: 'h1',
		title: 'Heading',
		examples: ['[h1][/h1], [h2][/h2], [h3][/h3], [h4][/h4], [h5][/h5], [h6][/h6]'],
		options: [
			{ tag: 'h1', title: '1st', className: 'heading-h1' },
			{ tag: 'h2', title: '2nd', className: 'heading-h2' },
			{ tag: 'h3', title: '3rd', className: 'heading-h3' },
			{ tag: 'h4', title: '4th', className: 'heading-h4' },
			{ tag: 'h5', title: '5th', className: 'heading-h5' },
			{ tag: 'h6', title: '6th', className: 'heading-h6' }
		]
	}
];

/**
 * Block and positioning related tags.
 */
Decoda.filters.block = [
	{ tag: 'left', title: 'Left Align' },
	{ tag: 'center', title: 'Center Align' },
	{ tag: 'right', title: 'Right Align' },
	{ tag: 'justify', title: 'Justify Align' },
	{ tag: 'hide', title: 'Hide' },
	{ tag: 'spoiler', title: 'Spoiler' }
];

/**
 * List item related tags.
 */
Decoda.filters.list = [
	{ tag: 'list', title: 'Unordered List' },
	{ tag: 'olist', title: 'Ordered List' },
	{ tag: 'li', title: 'List Item' }
];

/**
 * Quote related tags.
 */
Decoda.filters.quote = [
	{
		tag: 'quote',
		key: 'q',
		title: 'Quote Block',
		prompt: 'Author:',
		hasDefault: true,
		examples: ['[quote][/quote]', '[quote="Author"][/quote]', '[quote date="12/12/2012"][/quote]'],
		attributes: ['default <span>(optional)</span>', 'date <span>(optional)</span>']
	}
];

/**
 * Code and variable related tags.
 */
Decoda.filters.code = [
	{
		tag: 'code',
		title: 'Code Block',
		examples: ['[code][/code]', '[code="html"][/code]', '[code hl="1,5,10"][/code]'],
		attributes: ['default <span>(optional)</span>', 'hl <span>(optional)</span>']
	}, {
		tag: 'var',
		title: 'Variable'
	}
];

/**
 * Email related tags.
 */
Decoda.filters.email = [
	{
		tag: 'email',
		key: 'e',
		title: 'Email',
		prompt: 'Email Address:',
		hasDefault: true,
		examples: ['[email]email@domain.com[/email]', '[email="email@domain.com"][/email]'],
		attributes: ['default <span>(optional)</span>']
	}
];

/**
 * URL related tags.
 */
Decoda.filters.url = [
	{
		tag: 'url',
		key: 'l',
		title: 'URL',
		prompt: 'Web Address:',
		hasDefault: true,
		examples: ['[url]http://domain.com[/url]', '[url="http://domain.com"][/url]'],
		attributes: ['default <span>(optional)</span>']
	}
];

/**
 * Image related tags.
 */
Decoda.filters.image = [
	{
		tag: 'img',
		key: 'i',
		title: 'Image',
		prompt: 'Image URL:',
		examples: ['[img][/img]', '[img width="250" height="15%"][/img]'],
		attributes: ['width <span>(optional)</span>', 'height <span>(optional)</span>']
	}
];

/**
 * Video related tags.
 */
Decoda.filters.video = [
	{
		tag: 'video',
		key: 'v',
		title: 'Video',
		prompt: 'Video Code:',
		promptFor: 'content',
		hasDefault: true,
		examples: ['[video="youtube"]videoCode[/video]'],
		attributes: ['default'],
		options: [
			{ title: 'YouTube', defaultValue: 'youtube', className: 'video-youtube' },
			{ title: 'Vimeo', defaultValue: 'vimeo', className: 'video-vimeo' },
			{ title: 'Veoh', defaultValue: 'veoh', className: 'video-veoh' },
			{ title: 'LiveLeak', defaultValue: 'liveleak', className: 'video-liveleak' }
		]
	}
];

/**
 * Editor processing commands.
 */
Decoda.controls.editor = [
	{
		tag: 'preview',
		key: 'p',
		title: 'Preview',
		onClick: function(command, button) {
			if (!this.options.previewUrl) {
				alert('Preview functionality has not been enabled.');
				return;
			}

			this.container.hide();
			this.help.hide();

			if (this.preview.isVisible()) {
				this.preview.hide().empty();
				this.container.show();
				this.enableToolbar();

			} else {
				this.preview.show();
				this.disableToolbar();
				this.renderPreview();
			}

			button.set('disabled', false);
		}
	}, {
		tag: 'clean',
		key: 'c',
		title: 'Clean',
		onClick: function() {
			this.disableToolbar();

			if (this.clean()) {
				window.setTimeout(function() {
					this.enableToolbar();
				}.bind(this), 500);
			}
		}
	}, {
		tag: 'help',
		key: 'h',
		title: 'Help',
		onClick: function(command, button) {
			this.container.hide();
			this.preview.hide();

			if (!this.help.hasChildNodes()) {
				this.renderHelp();
			}

			if (this.help.isVisible()) {
				this.help.hide();
				this.container.show();
				this.enableToolbar();

			} else {
				this.help.show();
				this.disableToolbar();
			}

			button.set('disabled', false);
		}
	}
];