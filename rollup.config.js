'use strict';

const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');

module.exports = {
  entry: './index.js',
  moduleName: 'chronokinesis',
  plugins: [
    commonjs({
      sourceMap: false
    }),
    babel({
      presets: ['es2015-rollup'],
      exclude: 'node_modules/**'
    })
  ],
  targets: [
    { dest: 'src/index.es.js', format: 'es' }
  ]
};
