llevel
===========

[![Build Status](https://secure.travis-ci.org/paed01/llevel.png)](http://travis-ci.org/paed01/llevel) [![Test Coverage](https://codeclimate.com/github/paed01/llevel/badges/coverage.svg)](https://codeclimate.com/github/paed01/llevel) [![NPM version](https://badge.fury.io/js/llevel.png)](http://badge.fury.io/js/llevel)

Log level handling, and thats it.

Install **llevel**:
```
npm install llevel
```

# Introduction

The *llevel* module handles the importance of log levels. It can be used to decide if a record should be logged or not.

## Log levels

Default levels in ascending importance:

* `trace`
* `debug`
* `info`
* `warn`
* `error`
* `fatal`
* `off` - The logging is effectively turned off

## Examples

### Make a decision to log

```javascript

var Llevel = require('llevel');

var llevel = new Llevel('debug');

llevel.important('warn', function(err, important) {
    if (important) {
        console.log('warn', 'is more important than', llevel.level);
    }
});

llevel.important('trace', function(err, important) {
    if (important) {
        console.log('trace', 'is less important than', llevel.level, 'so this is ignored');
    }
});

```

### Decision from array

Make decision to log from an array of strings.

```javascript

var Llevel = require('llevel');

var llevel = new Llevel('info');

llevel.important(['warn', 'tag1'], function(err, important, level) {
    if (important) {
        console.log(level, 'is more important than', llevel.level);
    }
});

llevel.important(['trace', 'hapi', 'debug', 'info'], function(err, important, level) {
    if (important) {
        console.log(level, 'is equally important to', llevel.level, 'so this should happen');
    }
});

```

### Custom levels

Supply your own custom levels.

```javascript

var Llevel = require('llevel');

var levels = {
    no : -2,
    none : -1,
    information : 0,
    warning : 1,
    fatal : 2,
    'more fatal' : 3,
    deadly : 666
};
var llevel = new Llevel(levels);

llevel.important(['warning', 'tag1'], function (err, important, level) {
    if (important) {
        console.log(level, 'is more important than', llevel.level);
    }
});

// Set default level
llevel = new Llevel('more fatal', levels);

llevel.important('deadly', function (err, important, level) {
    if (important) {
        console.log(level, 'is more important than', llevel.level);
    }
});

```

## Usage

### `new Llevel([minLevel], [customLevels])`

- `minLevel` - optional argument to be used as minimum level, defaults to `trace`
- `customLevels` - optional argument to be used as levels, must be an object where: 
  - `key` - level name. The key is made lowercase
  - `value` - `number`, level importance, is tested with `isFinite`. Negative numbers are considered `off`

```javascript
var llevel = new Llevel();
// llevel.level -> trace
```
  
When setting `minLevel` the argument is compared with levels. If the minimum level is not found the lowest positive level is used.

```javascript
var llevel = new Llevel('trace');
// llevel.level -> trace

var llevel = new Llevel('info', {
    none : -2,
    trace : 0,
    information : 1
});
// llevel.level -> trace
```

When setting `customLevels` the object is cloned.

```javascript
var levels = {
    none : -2,
    trace : 0,
    information : 1
};
var llevel = new Llevel(levels);
levels.warn = 10;

// llevel.levels -> {none: -2, trace: 0, information: 1}
```

To ensure that the log level is found among level names (object keys) are lower cased. This also ensures that the levels are unique.

```javascript
var llevel = new Llevel({
    none : -2,
    trace : 0,
    TRACE : 1,
    tracE : 2,
    information : 3
});
// llevel.levels -> {none: -2, trace: 2, information: 3}
```

Object values in `customLevels` that are not numbers are ignored.
 
```javascript
var llevel = new Llevel({
    none : -2,
    trace : 0,
    information : 1,
    err : 'fatal'
});
// llevel.levels -> {none: -2, trace: 2, information: 1}
```

If both `minLevel` and `customLevels` are used the `minLevel` should match one of the custom levels. If not, the lowest positive level is used as `minLevel`.
 
```javascript
var llevel = new Llevel('none', {
    none : -2,
    trace : 0,
    information : 1
});
// llevel.level -> none
// llevel.levels -> {none: -2, trace: 2, information: 1}

var llevel = new Llevel('warn', {
    none : -2,
    trace : 0,
    information : 1
});
// llevel.level -> trace
// llevel.levels -> {none: -2, trace: 2, information: 1}
```

### `important(level, [minLevel], callback)`

Is the level important enough?

- `level` - The level or levels to test for importance. Must be a string or an array of strings
- `minLevel` - Optional minimum level, defaults to `minLevel` argument in constructor
- `callback` - Callback function using the signature `function(err, important, level)` where:
  - `err` - decision failed, the error reason, otherwise `null`
  - `important` - `boolean`, `true` if `level` is equally or more important than minimum level, otherwise `false`. If `level` is an array the most important level is compared to minimum level
  - `level` - the most important level from argument `level`. Especially interresting if `level` is an array 