llevel
===========

Log level handling, and thats it

Install **llevel**:
```
npm install llevel
```

# Introduction

The *llevel* module handles the importance of log levels. It is can be used to decide if a record should be logged.

Loglevels in ascending importance:

* `trace`
* `debug`
* `info`
* `warn`
* `error`
* `fatal`
* `off` - The logging is effectively turned off

## Examples

### Make as decision to log

```javascript

var Llevel = require('./index');

var llevel = new Llevel('debug');

llevel.important('warn', function(err, yes) {
    if (yes) {
        console.log('warn', 'is more important than', llevel.level);
    }
});

llevel.important('trace', function(err, yes) {
    if (yes) {
        console.log('trace', 'is less important than', llevel.level, 'so this should never happen');
    }
});

```

### Decision from array

Decision to log can be decided from an array of strings.

```javascript

var Llevel = require('./index');

var llevel = new Llevel('info');

llevel.important(['warn', 'tag1'], function(err, yes, level) {
    if (yes) {
        console.log(level, 'is more important than', llevel.level);
    }
});

llevel.important(['trace', 'api', 'debug', 'info'], function(err, yes, level) {
    if (yes) {
        console.log(level, 'is equally important to', llevel.level, 'so this should happen');
    }
});

```

## Usage

### `new Llevel([level])`

- `level` - optional argument to be used as minimum level, defaults to `trace`

### `important(level, [minLevel], callback)`

- `level` - The level or levels to test for importance. Must be a string or an array of strings
- `minLevel` - Optional minimum level, defaults to level argument in constructor
- `callback` - Callback function using the signature `function(err, yes, level)` where:
  - `err` - decision failed, the error reason, otherwise `null`.
  - `yes` - boolean decision based on importance
  - `level` - the most important level. Especially interresting if an array is passed to `level`