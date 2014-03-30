'use strict'
module.exports = (grunt) ->
    # load all grunt tasks
    # this assumes matchdep, grunt-contrib-watch, grunt-contrib-coffee,
    # grunt-coffeelint, grunt-contrib-clean, grunt-contrib-uglify is in the package.json file
    require('matchdep').filterDev('grunt-*').forEach grunt.loadNpmTasks

    grunt.initConfig
        # load in the module information
        pkg: grunt.file.readJSON 'package.json'
        # path to Grunt file for exclusion
        gruntfile: 'Gruntfile.coffee'
        # generalize the module information for banner output
        banner: '/**\n' +
                        ' * Module: <%= pkg.name %> - v<%= pkg.version %>\n' +
                        ' * Description: <%= pkg.description %>\n' +
                        ' * Date Built: <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                        ' * Copyright (c) <%= grunt.template.today("yyyy") %>' +
                        '  | <%= pkg.author.name %>;\n' +
                        '**/\n'

        complexity:
            generic:
                src: ['BGD.js']
            options:
                errorsOnly: false
                cyclometric: 6        # default is 3
                halstead: 16          # default is 8
                maintainability: 100  # default is 100

        jshint:
            all: [
                'Gruntfile.js'
                'BGD.js'
                'test/**/*.js'
            ]
            options:
                jshintrc: '.jshintrc'

        mochacli:
            all: ['test/**/*.js']
            options:
                reporter: 'spec'
                ui: 'tdd'

        watch:
            js:
                files: ['BGD.js', '!node_modules/**/*.js']
                tasks: ['default']
                options:
                    nospawn: true


    grunt.registerTask 'test', ['complexity', 'jshint', 'mochacli', 'watch']
    grunt.registerTask 'ci', ['complexity', 'jshint', 'mochacli']
    grunt.registerTask 'default', ['test']
