var chai  = require('chai');

// Chai extensions
chai.use(require('chai-as-promised'));
chai.use(require('chai-things'));
chai.config.includeStack = true;

module.exports = chai;
