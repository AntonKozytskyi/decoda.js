module.exports = function(grunt) {
    function createBanner() {
        return "/*!\n" +
            " * <%= pkg.name %> v<%= pkg.version %>\n" +
            " * <%= pkg.copyright %> - <%= pkg.homepage %>\n" +
            " * <%= pkg.licenses[0].type %> - <%= pkg.licenses[0].url %>\n" +
            " */";
    }

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        name: '<%= pkg.name.toLowerCase() %>-<%= pkg.version %>',
        uglify: {
            options: {
                banner: createBanner() + "\n",
                report: 'min'
            },
            build: {
                src: 'src/js/*.js',
                dest: 'build/<%= name %>.min.js'
            }
        },
        cssmin: {
            options: {
                banner: createBanner(),
                report: 'min'
            },
            build: {
                files: {
                    'build/<%= name %>.min.css': 'src/css/decoda.css',
                    'build/decoda-ie-<%= pkg.version %>.min.css': 'src/css/decoda-ie.css',
                    'build/decoda-theme-<%= pkg.version %>.min.css': 'src/css/decoda-theme.css'
                }
            }
        },
        jshint: {
            options: {
                globals: {
                    Decoda: true,
                    alert: true,
                    prompt: true
                },
                browser: true,
                mootools: true,
                // enforcing
                camelcase: true,
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                noempty: true,
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
                src: 'src/js/*.js'
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // Register tasks
    grunt.registerTask('validate', ['jshint']);
    grunt.registerTask('default', ['jshint', 'uglify', 'cssmin']);
};