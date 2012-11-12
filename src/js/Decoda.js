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
	 * Textarea to wrap.
	 */
	textarea: null,

	/**
	 * Options.
	 */
	options: {
		open: '[',
		close: ']',
		namespace: '',
		defaults: true,
		onSubmit: null,
		onRender: null,
		onInsert: null
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
		this.toolbar = new Element('div.decoda-toolbar');

		this.editor.grab(this.toolbar).wraps(this.textarea);

		// Load defaults
		if (this.options.namespace) {
			this.editor.addClass(this.options.namespace);
		}

		if (this.options.defaults) {
			this.defaults();
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
	 */
	defaults: function(blacklist) {
		Object.each(Decoda.filters, function(filter) {
			this.addFilters(filter, blacklist);
		}.bind(this));

		Object.each(Decoda.controls, function(control) {
			this.addControls(control, blacklist);
		}.bind(this));
	},

	/**
	 * Add controls to the toolbar.
	 *
	 * @param {Array} controls
	 * @param {Array} blacklist
	 */
	addControls: function(controls, blacklist) {
		this.buildToolbar(controls, blacklist);
	},

	/**
	 * Add filters to the toolbar.
	 *
	 * @param {Array} filters
	 * @param {Array} blacklist
	 */
	addFilters: function(filters, blacklist) {
		this.buildToolbar(filters, blacklist);
	},

	/**
	 * Add commands to the toolbar.
	 *
	 * @param {Array} commands
	 * @param {Array} blacklist
	 */
	buildToolbar: function(commands, blacklist) {
		blacklist = Array.from(blacklist) || [];

		var self = this,
			ul = new Element('ul');

		// Create menu using the commands
		Object.each(commands, function(command, key) {
			command.tag = key;

			if (blacklist.indexOf(command.tag) >= 0) {
				return;
			}

			var li = new Element('li'),
				button = new Element('button.tag-' + command.tag, {
					html: '<span></span>',
					title: command.title,
					type: 'button',
					events: {
						click: (command.onClick ? command.onClick : self.insertTag).bind(self, command)
					}
				});

			if (command.className) {
				button.addClass(command.className);
			}

			li.grab(button);

			// Create sub-menu using options
			if (command.options) {
				var sub = new Element('ul.toolbar-menu').addClass('menu-' + command.tag);

				command.options.each(function(option) {
					option = Object.merge({}, command, option);

					if (blacklist.indexOf(option.tag) >= 0) {
						return;
					}

					var anchor = new Element('a', {
						href: 'javascript:;',
						html: '<span></span>' + option.title,
						title: option.title,
						events: {
							click: (option.onClick ? option.onClick : self.insertTag).bind(self, option)
						}
					});

					if (option.className) {
						anchor.addClass(option.className);
					}

					sub.grab(new Element('li').grab(anchor));
				});

				li.grab(sub);
			}

			ul.grab(li);
		});

		this.toolbar.grab(ul);

		this.fireEvent('render', ul);
	},

	/**
	 * Clean the textarea input.
	 *
	 * @return {String}
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

		return value;
	},

	/**
	 * Insert a tag into the textarea. If a prompt is defined, grab the value.
	 *
	 * @param {Object} tag
	 */
	insertTag: function(tag) {
		var selected,
			defaultValue,
			contentValue,
			field = tag.promptFor || 'default';

		// Grab a value from the prompt
		if (tag.prompt) {
			var answer = prompt(tag.prompt);

			// Trigger callback on the value
			if (tag.onInsert && typeOf(tag.onInsert) === 'function') {
	            answer = tag.onInsert(answer, field);
			}

			if (field === 'default') {
				defaultValue = answer;
			} else {
				contentValue = answer;
			}
		}

		// Text is selected
		var markup = this.formatTag(tag, defaultValue, contentValue);

		if (selected = this.textarea.getSelectedText()) {
			if (tag.selfClose) {
				this.textarea.insertAtCursor(selected + markup);

			} else {
				this.textarea.insertAroundCursor({
					before: this.formatTag(tag, defaultValue, contentValue, 'open'),
					after: this.formatTag(tag, defaultValue, contentValue, 'close'),
					defaultMiddle: selected
				});
			}

		// Insert at cursor
		} else {
			this.textarea.insertAtCursor(markup);
		}

		this.fireEvent('insert', markup);
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
		if (tag.hasDefault && tag.prompt) {
			if (defaultValue) {
				open += '="' + defaultValue + '"';
			}

		// Else always show an empty default attribute
		} else if (tag.hasDefault) {
			open += '="' + defaultValue + '"';
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
	}

});

/**
 * Collection of tags indexed by filter.
 *
 * @type {Object}
 */
Decoda.filters = {

	default: {
		b: { title: 'Bold', key: 'b' },
		i: { title: 'Italics', key: 'i' },
		u: { title: 'Underline', key: 'u' },
		s: { title: 'Strike-Through', key: 's' },
		sub: { title: 'Subscript' },
		sup: { title: 'Superscript' },
		abbr: { title: 'Abbreviation', hasDefault: true },
		br: { title: 'Line Break', selfClose: true },
		h: { title: 'Horizontal Break', selfClose: true }
	},

	text: {
		font: {
			title: 'Font Family',
			prompt: 'Font:',
			hasDefault: true,
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
			title: 'Text Size',
			prompt: 'Size:',
			hasDefault: true,
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
			title: 'Text Color',
			prompt: 'Hex Code:',
			hasDefault: true,
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
		},
		h1: {
			title: 'Heading',
			options: [
				{ tag: 'h1', title: '1st', className: 'heading-h1' },
				{ tag: 'h2', title: '2nd', className: 'heading-h2' },
				{ tag: 'h3', title: '3rd', className: 'heading-h3' },
				{ tag: 'h4', title: '4th', className: 'heading-h4' },
				{ tag: 'h5', title: '5th', className: 'heading-h5' },
				{ tag: 'h6', title: '6th', className: 'heading-h6' }
			]
		}
	},

	block: {
		left: { title: 'Left Align' },
		center: { title: 'Center Align' },
		right: { title: 'Right Align' },
		justify: { title: 'Justify Align' },
		hide: { title: 'Hide' },
		spoiler: { title: 'Spoiler' }
	},

	list: {
		list: { title: 'Unordered List' },
		olist: { title: 'Ordered List' },
		li: { title: 'List Item' }
	},

	quote: {
		quote: { title: 'Quote Block', key: 'q', prompt: 'Author:', hasDefault: true }
	},

	code: {
		code: { title: 'Code Block' },
		var: { title: 'Variable' }
	},

	email: {
		email: { title: 'Email', key: 'e', prompt: 'Email Address:', hasDefault: true }
	},

	url: {
		url: { title: 'URL', key: 'l', prompt: 'Web Address:', hasDefault: true }
	},

	image: {
		img: { title: 'Image', key: 'i', prompt: 'Image URL:' }
	},

	video: {
		video: {
			title: 'Video',
			key: 'v',
			prompt: 'Video Code:',
			promptFor: 'content',
			hasDefault: true,
			options: [
				{ title: 'YouTube', defaultValue: 'youtube', className: 'video-youtube' },
				{ title: 'Vimeo', defaultValue: 'vimeo', className: 'video-vimeo' },
				{ title: 'Veoh', defaultValue: 'veoh', className: 'video-veoh' },
				{ title: 'LiveLeak', defaultValue: 'liveleak', className: 'video-liveleak' }
			]
		}
	}

};

/**
 * Collection of commands indexed by control group.
 *
 * @type {Object}
 */
Decoda.controls = {

	editor: {
		preview: {
			title: 'Preview',
			onClick: function() {
				alert('Preview functionality has not been defined.');
			}
		},
		clean: {
			title: 'Clean',
			onClick: function() {
				this.clean();
			}
		}
	},

	formatting: {
		capitalize: {
			title: 'Capitalize',
			onClick: function() {
				var selected = this.textarea.getSelectedText();

				if (selected) {
					this.textarea.insertAtCursor(selected.capitalize());
				}
			}
		},
		lowercase: {
			title: 'Lowercase',
			onClick: function() {
				var selected = this.textarea.getSelectedText();

				if (selected) {
					this.textarea.insertAtCursor(selected.toLowerCase());
				}
			}
		},
		uppercase: {
			title: 'Uppercase',
			onClick: function() {
				var selected = this.textarea.getSelectedText();

				if (selected) {
					this.textarea.insertAtCursor(selected.toUpperCase());
				}
			}
		},
		replace: {
			title: 'Replace',
			prompt: 'Replace With:',
			onClick: function(control) {
				var selected = this.textarea.getSelectedText();

				if (selected) {
					var replaceWith = prompt(control.prompt);

					if (!replaceWith) {
						return;
					}

					this.textarea.insertAtCursor(replaceWith);
				}
			}
		}
	}

};