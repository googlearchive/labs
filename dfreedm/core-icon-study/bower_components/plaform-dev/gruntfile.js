/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
module.exports = function(grunt) {
  var readManifest = require('../tools/loader/readManifest.js');

  grunt.initConfig({
    karma: {
      options: {
        configFile: 'conf/karma.conf.js',
        keepalive: true,
      },
      buildbot: {
        reporters: ['crbot'],
        logLevel: 'OFF'
      },
      platform: {
      }
    },
    concat_sourcemap: {
      Platform: {
        options: {
          sourcesContent: true,
          nonull: true
        },
        files: {
          'build/platform.concat.js': readManifest('build.json')
        }
      }
    },
    concat: {
      lite: {
        files: {
          'build/platform-lite.concat.js': readManifest('build-lite.json')
        }
      }
    },
    uglify: {
      options: {
        nonull: true,
        compress: {
          unsafe: false
        }
      },
      Platform: {
        options: {
          sourceMap: true,
          sourceMapName: 'build/platform.js.map',
          sourceMapIn: 'build/platform.concat.js.map',
          sourceMapIncludeSources: true,
          banner: grunt.file.read('LICENSE') + '// @version: <%= buildversion %>'
        },
        files: {
          'build/platform.js': 'build/platform.concat.js'
        }
      }
    },
    audit: {
      platform: {
        options: {
          repos: [
            '../CustomElements',
            '../HTMLImports',
            '../NodeBind',
            '../PointerEvents',
            '../PointerGestures',
            '../ShadowDOM',
            '../TemplateBinding',
            '../WeakMap',
            '../observe-js',
            '../platform',
            '../polymer-expressions'
          ]
        },
        files: {
          'build/build.log': 'build/platform.js'
        }
      }
    },
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          exclude: 'third_party',
          paths: '.',
          outdir: 'docs',
          linkNatives: 'true',
          tabtospace: 2,
          themedir: '../tools/doc/themes/bootstrap'
        }
      }
    },
    pkg: grunt.file.readJSON('package.json')
  });

  grunt.loadTasks('../tools/tasks');
  // plugins
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-concat-sourcemap');
  grunt.loadNpmTasks('grunt-audit');

  grunt.registerTask('stash', 'prepare for testing build', function() {
    grunt.option('force', true);
    grunt.task.run('move:platform.js:platform.js.bak');
    grunt.task.run('move:build/platform.js:platform.js');
  });
  grunt.registerTask('restore', function() {
    grunt.task.run('move:platform.js:build/platform.js');
    grunt.task.run('move:platform.js.bak:platform.js');
    grunt.option('force', false);
  });

  grunt.registerTask('minify', ['concat_sourcemap', 'version', 'uglify', 'sourcemap_copy:build/platform.concat.js.map:build/platform.js.map']);
  grunt.registerTask('default', ['minify']);
  grunt.registerTask('docs', ['yuidoc']);
  grunt.registerTask('test', ['override-chrome-launcher', 'karma:platform']);
  grunt.registerTask('test-build', ['minify', 'stash', 'test', 'restore']);
  grunt.registerTask('test-build-cr', ['minify', 'stash', 'karma:buildbot', 'restore']);
  grunt.registerTask('test-buildbot', ['override-chrome-launcher', 'karma:buildbot', 'test-build-cr']);
  grunt.registerTask('build-lite', ['concat:lite']);
};

