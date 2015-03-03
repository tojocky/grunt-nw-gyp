var defaultArgv, gyp, manualRebuild;

gyp = require('nw-gyp')();

defaultArgv = ['node', '.', '--loglevel=silent'];

manualRebuild = function(callback) {
  return gyp.commands.clean([], function(error) {
    if (error) {
      return callback(error);
    }
    return gyp.commands.configure([], function(error) {
      if (error) {
        return callback(error);
      }
      return gyp.commands.build([], callback);
    });
  });
};

module.exports = function(grunt) {
  return grunt.registerMultiTask('nw-gyp', 'Run nw-gyp commands from Grunt.', function() {
    var argv, curr_arg, done, gypCallback, options;
    done = this.async();
    options = this.options({
      debug: false
    });
    argv = defaultArgv.slice();
    if (options.debug) {
      argv.push('--debug');
    } else {
      argv.push('--no-debug');
    }
    if (options.arch) {
      argv.push("--arch=" + options.arch);
    }

    var i;
    for(i = 2; i < process.argv.length; ++i) {
      var curr_arg = process.argv[i];
      if(/^--/.test(curr_arg)) {
        console.log('adding extra gyp arg ' + curr_arg);
        argv.push(curr_arg);
      }
    }
    gyp.parseArgv(argv);
    gypCallback = function(error) {
      if (error) {
        return done(error);
      } else {
        return done();
      }
    };
    if (!this.data.command) {
      this.data.command = 'rebuild';
    }
    switch (this.data.command) {
      case 'clean':
        return gyp.commands.clean([], gypCallback);
      case 'configure':
        return gyp.commands.configure([], gypCallback);
      case 'build':
        return gyp.commands.build([], gypCallback);
      case 'rebuild':
        return manualRebuild(gypCallback);
    }
  });
};
