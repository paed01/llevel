var internals = {};

function getMinimumLevel(levels) {
    var minLevel = 'trace';
    if (typeof levels !== 'object') {
        return 'trace';
    }
    
    var rl = Infinity;
    for(var l in levels) {
        var il = levels[l];
        if (isFinite(il) && il >= 0 && il < rl) {
            rl = il;
            minLevel = l;
        }
    }
    return minLevel;
}

module.exports = internals.Loglevel = function (level) {

    if (this.constructor !== internals.Loglevel) {
        throw new Error('Loglevel must be instantiated using new');
    }

    this.levels = {
        off : -1,
        fatal : 16,
        error : 8,
        warn : 4,
        info : 2,
        debug : 1,
        trace : 0
    };

    if (typeof level === 'string' && !!this.levels[level.toLowerCase()]) {
        this.level = level;
    } else {
        this.level = getMinimumLevel(this.levels);
    }
};

internals.Loglevel.prototype.resolve = function (level, getMinimumLevelIfNotFound) {
    if (typeof level !== 'string') {
        return -1;
    }
    var levelInt = -1;
    if (getMinimumLevelIfNotFound) {
        if (!this.levels[level.toLowerCase()]) {
            level = getMinimumLevel(this.levels);
        }
    }
    
    if (!isFinite(levelInt = this.levels[level.toLowerCase()])) {
        return -1;
    }
    return levelInt;
};

internals.Loglevel.prototype.levelFromArray = function (tags) {
    // Returns top (max) level as string from array
    if (!Array.isArray(tags)) {
        return null;
    }

    var topLevel = null;
    var topLevelInt = 0;
    for (var al in tags) {
        var level = tags[al];
        var rla = this.resolve(level);
        if (rla >= topLevelInt) {
            topLevelInt = rla;
            topLevel = level.toLowerCase();
        }
    }
    return topLevel;
};

internals.Loglevel.prototype.compare = function (level, minLevelInt) {

    var minLevelInteger = ~~minLevelInt;
    var compareLevel = this.resolve(level);

    if (compareLevel < 0) {
        return -1;
    }

    return compareLevel >= minLevelInteger ? compareLevel : -1;
};

internals.Loglevel.prototype.important = function (level, minLevelOrCallback, callback) {
    var innerCallback = function (l, topLevel) {
        if (typeof callback == 'function') {
            setImmediate(callback, null, l, topLevel);
        }
    };
    
    var minLevel;
    if (typeof minLevelOrCallback === 'function') {
        callback = minLevelOrCallback;
        minLevel = this.level;
    } else {
        minLevel = minLevelOrCallback;
    }

    var minLevelInt = this.resolve(minLevel, true);
    if (minLevelInt < 0) {
        return innerCallback(false);
    }
    
    if (Array.isArray(level)) {
        level = this.levelFromArray(level);
    }

    var inLevel = this.resolve(level);
    if (inLevel < 0) {
        return innerCallback(false);
    }

    var rls = this.compare(level, minLevelInt);

    return innerCallback((rls >= 0), level.toLowerCase());
};

internals.Loglevel.prototype.getMinimumLevel = getMinimumLevel;
