module.exports = function(wallaby) {
  return {
    env: {
      type: 'node'
    },
    testFramework: 'mocha',

    files: [
      'src/**/*.ts',
      {
        pattern: 'test/**/_suite.ts',
        instrument: false
      }
    ],
    tests: ['test/unit/**/*.ts'],
    setup() {
      const chai = require('chai');
      chai.use(require('sinon-chai'));
    }
  };
};
