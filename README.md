llevel
===========

[![Build Status](https://secure.travis-ci.org/paed01/llevel.png)](http://travis-ci.org/paed01/llevel) [![NPM version](https://badge.fury.io/js/llevel.png)](http://badge.fury.io/js/llevel)

Log level handling, and thats it.

Install **llevel**:
```
npm install llevel
```

# Introduction

The *llevel* module handles the importance of log levels. It is can be used to decide if a record should be logged or not.

Loglevels in ascending importance:

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
        console.log('trace', 'is less important than', llevel.level, 'so this should never happen');
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
  - `key` - level name
  - `value` - `number`, level importance, is tested with `isFinite`. Value below 0 is considered `off`

### `important(level, [minLevel], callback)`

Is the level important enough?

- `level` - The level or levels to test for importance. Must be a string or an array of strings
- `minLevel` - Optional minimum level, defaults to `minLevel` argument in constructor
- `callback` - Callback function using the signature `function(err, important, level)` where:
  - `err` - decision failed, the error reason, otherwise `null`
  - `important` - `boolean`, `true` if `level` is equally or more important than minimum level, otherwise `false`. If `level` is an array the most important level is compared to minimum level
  - `level` - the most important level from argument `level`. Especially interresting if `level` is an array 