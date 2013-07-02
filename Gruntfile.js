module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'src/js/*.js',
				dest: 'build/<%= pkg.name %>-<%= pkg.version %>.min.js'
			}
		},
		jshint: {
			options: {
				globals: {
					Decoda: true
				},
				browser: true,
				mootools: true,
				// enforcing
				//camelcase: true,
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				noempty: true,
				quotmark: 'single',
				smarttabs: true,
				undef: true,
				unused: true,
				strict: true,
				trailing: true,
				// relaxing
				boss: true,
				scripturl: true
			},
			build: {
				src: ['src/js/*.js']
			}
		}
	});

	// Load plugins
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	// Register tasks
	grunt.registerTask('validate', ['jshint']);
	grunt.registerTask('default', ['jshint', 'uglify']);
};