var Reporter = require('jasmine-terminal-reporter');
var reporter = new Reporter(options = {colors: false});

jasmine.getEnv().addReporter(reporter);