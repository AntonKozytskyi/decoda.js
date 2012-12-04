/**
 * @copyright   Copyright 2006-2013, Miles Johnson - http://milesj.me
 * @license     http://opensource.org/licenses/mit-license.php - Licensed under The MIT License
 * @link        http://milesj.me/code/mootools/decoda
 */

(function() {
	"use strict";

/**
 * Creates a lightweight textarea editor with toolbar functionality for the Decoda markup language.
 *
 * @version	1.1.0
 * @uses	MooTools/Core
 * @uses	MooTools/More/Element.Forms
 * @uses	MooTools/More/Element.Shortcuts
 */
window.Decoda = new Class({
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
	 * Parent form.
	 */
	form: null,

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
		maxNewLines: 3,
		onSubmit: null,
		onInsert: null,
		onInitialize: null,
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

		this.form = this.textarea.getParent('form');

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
			this.form.addEvent('submit', this.$events.submit[0].bind(this));
		}

		this.fireEvent('initialize');
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

			Object.each(tags, function(tag) {
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
			li,
			button,
			menu,
			anchor;

		// Create menu using the commands
		Object.each(commands, function(command) {
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

			if (command.key) {
				button.set('title', button.get('title') + ' (Ctrl + ' + command.key.toUpperCase() + ')');

				this.textarea.addEvent('keydown', function(e) {
					this._listenKeydown.attempt([e, command, button], this);
				}.bind(this));
			}

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
		var value = String.from(this.textarea.get('value')),
			max = this.options.maxNewLines;

		// Normalizes new lines
		value = value.replace(/\r\n/g, "\n"); // DOS to Unix
		value = value.replace(/\r/g, "\n"); // Mac to Unix

		// Remove extraneous newlines
		if (max) {
			value = value.replace(new RegExp("\n{" + (max + 1) + ",}", 'g'), "\n".repeat(max));
		}

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
	 * @param {Element} button
	 * @return {Decoda}
	 */
	insertTag: function(tag, button) {
		var defaultValue,
			contentValue = this.textarea.getSelectedText(),
			field = tag.promptFor || 'default',
			answer;

		// Grab a value from the prompt
		if (tag.prompt) {
			answer = prompt(tag.prompt);

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

		var markup = this.formatTag(tag, defaultValue, contentValue);

		// Text is selected
		if (this.textarea.getSelectedText()) {
			if (tag.selfClose) {
				this.textarea.insertAroundCursor({
					before: '',
					after: markup,
					defaultMiddle: ''
				});

			} else {
				this.textarea.insertAtCursor(markup);
			}

		// Insert at cursor
		} else {
			this.textarea.insertAtCursor(markup, false);

			// Move the caret in between the tags
			if (!tag.selfClose) {
				var close = this.formatTag(tag, defaultValue, contentValue, 'close');

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
			close = o + '/' + t + c,
			field;

		// Only append a default attribute if the value from a prompt is valid
		if (tag.hasDefault) {
			field = tag.promptFor || 'default';

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
	},

	/**
	 * Callback triggered each time a key is pressed.
	 * Will check for ctrl + key events.
	 *
	 * @param {Event} e
	 * @param {Object} command
	 * @param {Element} button
	 * @return {Boolean}
	 * @private
	 */
	_listenKeydown: function(e, command, button) {
		if (e.control && e.key === command.key) {
			e.stop();

			if (command.onClick) {
				command.onClick.attempt([command, button], this);
			} else {
				this.insertTag(command, button);
			}

			return false;
		}
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
Decoda.filters.defaults = {
	b: { tag: 'b', title: 'Bold', key: 'b' },
	i: { tag: 'i', title: 'Italics', key: 'i' },
	u: { tag: 'u', title: 'Underline', key: 'u' },
	s: { tag: 's', title: 'Strike-Through', key: 's' },
	sub: { tag: 'sub', title: 'Subscript' },
	sup: { tag: 'sup', title: 'Superscript' },
	abbr: {
		tag: 'abbr',
		title: 'Abbreviation',
		hasDefault: true,
		prompt: 'Title:',
		attributes: ['default'],
		examples: ['[abbr="Hyper-Text Markup Language"]HTML[/abbr]']
	},
	time: {
		tag: 'time',
		title: 'Timestamp',
		prompt: 'Date:',
		promptFor: 'content'
	},
	br: { tag: 'br', title: 'Line Break', selfClose: true },
	hr: { tag: 'hr', title: 'Horizontal Break', selfClose: true }
};

/**
 * Text and font related tags.
 */
Decoda.filters.text = {
	font: {
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
	},
	size: {
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
	},
	color: {
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
				return (/(?:#[0-9a-f]{3,6}|[a-z]+)/i).exec(value) ? value : null;
			}

			return value;
		}
	},
	heading: {
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
};

/**
 * Block and positioning related tags.
 */
Decoda.filters.block = {
	left: { tag: 'left', title: 'Left Align' },
	center: { tag: 'center', title: 'Center Align' },
	right: { tag: 'right', title: 'Right Align' },
	justify: { tag: 'justify', title: 'Justify Align' },
	hide: { tag: 'hide', title: 'Hide' },
	spoiler: { tag: 'spoiler', title: 'Spoiler' }
};

/**
 * List item related tags.
 */
Decoda.filters.list = {
	list: { tag: 'list', title: 'Unordered List' },
	olist: { tag: 'olist', title: 'Ordered List' },
	li: { tag: 'li', title: 'List Item' }
};

/**
 * Quote related tags.
 */
Decoda.filters.quote = {
	quote: {
		tag: 'quote',
		title: 'Quote Block',
		prompt: 'Author:',
		hasDefault: true,
		examples: ['[quote][/quote]', '[quote="Author"][/quote]', '[quote date="12/12/2012"][/quote]'],
		attributes: ['default <span>(optional)</span>', 'date <span>(optional)</span>']
	}
};

/**
 * Code and variable related tags.
 */
Decoda.filters.code = {
	code: {
		tag: 'code',
		title: 'Code Block',
		examples: ['[code][/code]', '[code="html"][/code]', '[code hl="1,5,10"][/code]'],
		attributes: ['default <span>(optional)</span>', 'hl <span>(optional)</span>']
	},
	var: {
		tag: 'var',
		title: 'Variable'
	}
};

/**
 * Email related tags.
 */
Decoda.filters.email = {
	email: {
		tag: 'email',
		title: 'Email',
		prompt: 'Email Address:',
		hasDefault: true,
		examples: ['[email]email@domain.com[/email]', '[email="email@domain.com"][/email]'],
		attributes: ['default <span>(optional)</span>']
	}
};

/**
 * URL related tags.
 */
Decoda.filters.url = {
	url: {
		tag: 'url',
		title: 'URL',
		prompt: 'Web Address:',
		hasDefault: true,
		examples: ['[url]http://domain.com[/url]', '[url="http://domain.com"][/url]'],
		attributes: ['default <span>(optional)</span>']
	}
};

/**
 * Image related tags.
 */
Decoda.filters.image = {
	img: {
		tag: 'img',
		title: 'Image',
		prompt: 'Image URL:',
		examples: ['[img][/img]', '[img width="250" height="15%"][/img]'],
		attributes: ['width <span>(optional)</span>', 'height <span>(optional)</span>']
	}
};

/**
 * Video related tags.
 */
Decoda.filters.video = {
	video: {
		tag: 'video',
		title: 'Video',
		prompt: 'Video ID:',
		promptFor: 'content',
		hasDefault: true,
		examples: ['[video="youtube"]ID[/video]', '[youtube size="large"]ID[/youtube]', '[veoh size="small"]ID[/veoh]'],
		attributes: ['default', 'size <span>(optional)</span>'],
		options: [
			{ tag: 'youtube', title: 'YouTube', hasDefault: false, className: 'video-youtube' },
			{ tag: 'vimeo', title: 'Vimeo', hasDefault: false, className: 'video-vimeo' },
			{ tag: 'veoh', title: 'Veoh', hasDefault: false, className: 'video-veoh' },
			{ tag: 'liveleak', title: 'LiveLeak', hasDefault: false, className: 'video-liveleak' },
			{ tag: 'dailymotion', title: 'Daily Motion', hasDefault: false, className: 'video-dailymotion' },
			{ tag: 'collegehumor', title: 'College Humor', hasDefault: false, className: 'video-collegehumor' },
			{ tag: 'myspace', title: 'MySpace', hasDefault: false, className: 'video-myspace' },
			{ tag: 'wegame', title: 'WeGame', hasDefault: false, className: 'video-wegame' }
		]
	}
};

/**
 * Editor processing commands.
 */
Decoda.controls.editor = {
	preview: {
		tag: 'preview',
		key: 'e',
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
	},
	clean: {
		tag: 'clean',
		title: 'Clean',
		onClick: function() {
			this.disableToolbar();

			if (this.clean()) {
				window.setTimeout(function() {
					this.enableToolbar();
				}.bind(this), 500);
			}
		}
	},
	help: {
		tag: 'help',
		title: 'Help',
		onClick: function(command, button) {
			if (!this.tags.length) {
				alert('No tag filters have been loaded.');
				return;
			}

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
};

}());