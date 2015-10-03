'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.config.init({

    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        jshintrc: true
      },
      all: ['*.js', './app/{,*/}*.js']
    },

    jscs: {
      src: './app/{,*/}*.js',
      options: {
        config: '.jscsrc',
        esnext: true,
        verbose: true
      }
    },

    watch: {
      scripts: {
        files: ['./app/{,*/}*.js'],
        tasks: ['jshint', 'jscs']
      }
    }

  });

  grunt.registerTask('default', [
    'jshint',
    'jscs',
    'watch'
  ]);

};
