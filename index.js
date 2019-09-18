'use strict';

const defaultLevels = {
  off: -1,
  fatal: 16,
  error: 8,
  warn: 4,
  info: 2,
  debug: 1,
  trace: 0
};

const internals = {};

function getMinimumLevel(levels) {
  let minLevel = 'trace';
  if (!levels || typeof levels !== 'object') {
    return 'trace';
  }

  let rl = Infinity;
  for (const l in levels) {
    const il = levels[l];
    if (isFinite(il) && il >= 0 && il < rl) {
      rl = il;
      minLevel = l;
    }
  }
  return minLevel;
}

module.exports = internals.Loglevel = function(level, levels) {
  if (!this) {
    throw new Error('Llevel must be instantiated using new');
  }
  if (!!level && typeof level === 'object') {
    levels = level;
  }

  const logLevels = typeof levels === 'object' ? levels : defaultLevels;
  this.setLevels(logLevels);

  if (typeof level === 'string' && !!this.levels[level.toLowerCase()]) {
    this.level = level;
  } else {
    this.level = getMinimumLevel(this.levels);
  }
};

internals.Loglevel.prototype.setLevels = function(levels) {
  if (!levels || typeof levels !== 'object') {
    return;
  }

  const logLevels = {};
  for (const l in levels) {
    const importance = levels[l];
    if (importance !== null && isFinite(importance)) {
      logLevels[l.toLowerCase()] = importance;
    }
  }

  this.levels = logLevels;
};

internals.Loglevel.prototype.resolve = function(level, returnMinimumLevelIfNotFound) {
  if (typeof level !== 'string') {
    return -1;
  }
  if (!this.levels) {
    this.setLevels(defaultLevels);
  }
  let levelInt = -1;
  if (returnMinimumLevelIfNotFound) {
    if (!this.levels[level.toLowerCase()]) {
      level = getMinimumLevel(this.levels);
    }
  }

  if (!isFinite(levelInt = this.levels[level.toLowerCase()])) {
    return -1;
  }
  return levelInt;
};

internals.Loglevel.prototype.levelFromArray = function(tags) {
  // Returns top (max) level as string from array
  if (!Array.isArray(tags)) {
    return null;
  }

  let topLevel = null;
  let topLevelInt = 0;
  for (const al in tags) {
    const level = tags[al];
    const rla = this.resolve(level);
    if (rla >= topLevelInt) {
      topLevelInt = rla;
      topLevel = level.toLowerCase();
    }
  }
  return topLevel;
};

internals.Loglevel.prototype.compare = function(level, minLevelInt) {
  const minLevelInteger = ~~minLevelInt;
  const compareLevel = this.resolve(level);

  if (compareLevel < 0) {
    return -1;
  }

  return compareLevel >= minLevelInteger ? compareLevel : -1;
};

internals.Loglevel.prototype._importantSync = function(level, minLevel) {
  const result = {
    important: false
  };
  const minLevelInt = this.resolve(minLevel, true);
  if (minLevelInt < 0) return result;

  if (Array.isArray(level)) {
    level = this.levelFromArray(level);
  }

  const intLevel = this.resolve(level);
  if (intLevel < 0) return result;

  result.level = level.toLowerCase();
  result.important = this.compare(level, minLevelInt) >= 0;

  return result;
};

internals.Loglevel.prototype.importantSync = function(level, minLevel) {
  return this._importantSync(level, minLevel).important;
};

internals.Loglevel.prototype.important = function(level, minLevelOrCallback, callback) {
  let minLevel;
  if (typeof minLevelOrCallback === 'function') {
    callback = minLevelOrCallback;
    minLevel = this.level;
  } else {
    minLevel = minLevelOrCallback;
  }

  function innerCallback(l, topLevel) {
    if (typeof callback === 'function') {
      setImmediate(callback, null, l, topLevel);
    }
  }
  const result = this._importantSync(level, minLevel);
  return innerCallback(result.important, result.level);
};

internals.Loglevel.prototype.getMinimumLevel = getMinimumLevel;
