'use strict';

const {describe, it} = exports.lab = require('@hapi/lab').script();
const {expect} = require('@hapi/code');

const Loglevel = require('../');

describe('llevel', () => {
  describe('#ctor', () => {
    it('throws if not instantiated with new', () => {
      function fn() {
        Loglevel();
      }
      expect(fn).to.throw(Error, 'Llevel must be instantiated using new');
    });

    it('takes level as argument', () => {
      const ll = new Loglevel('trace');
      expect(ll.level).to.equal('trace');
    });

    it('without argument returns lowest level', () => {
      const ll = new Loglevel();
      expect(ll.level).to.equal('trace');
    });

    it('with level not in levels returns lowest level', () => {
      const ll = new Loglevel('ysnp');
      expect(ll.level).to.equal('trace');
    });

    it('support custom levels', () => {
      const levels = {
        ysnp: 0
      };
      const ll = new Loglevel('ysnp', levels);
      expect(ll.level).to.equal('ysnp');
    });

    it('ignores custom levels that is not an object', () => {
      const levels = [];
      const ll = new Loglevel('ysnp', levels);
      expect(ll.level).to.equal('trace');
    });

    it('ignores custom level that is not finite', () => {
      const levels = {
        none: -1,
        warning: 0,
        string: 'me'
      };
      const ll = new Loglevel('warning', levels);
      expect(ll.levels).to.only.equal({
        none: -1,
        warning: 0
      });
    });

    it('with custom levels resolves the lowest level >0 as default', () => {
      const levels = {
        none: -1,
        warning: 0,
        important: 10000
      };
      const ll = new Loglevel(null, levels);
      expect(ll.level).to.equal('warning');
    });

    it('takes custom levels as first argument', () => {
      const levels = {
        none: -1,
        warning: 0
      };
      const ll = new Loglevel(levels);
      expect(ll.level).to.equal('warning');
    });

    it('ignores null as custom levels', () => {
      const ll = new Loglevel(null, null);
      expect(ll.level).to.equal('trace');
    });

    it('ignores function as custom levels', () => {
      const ll = new Loglevel(null, () => {});
      expect(ll.level).to.equal('trace');
    });
  });

  describe('#resolve', () => {
    const loglevel = new Loglevel('trace');

    it('resolves level to corresponding int', () => {
      expect(loglevel.resolve('trace')).to.equal(0);
    });

    it('resolves level to corresponding int case-insensitive', () => {
      expect(loglevel.resolve('WARN')).to.equal(4);
    });

    it('returns -1 if not a string', () => {
      expect(loglevel.resolve(0)).to.equal(-1);
    });

    it('returns -1 if null', () => {
      expect(loglevel.resolve(null)).to.equal(-1);
    });

    it('returns -1 if not found', () => {
      expect(loglevel.resolve('ysnp')).to.equal(-1);
    });

    it('returns custom level', () => {
      const ll = new Loglevel('info', {MIN: 1000});
      expect(ll.resolve('MIN')).to.equal(1000);
    });

    it('returns -1 if custom level is not found', () => {
      const ll = new Loglevel('info', {WARN: 1});
      expect(ll.resolve('MIN')).to.equal(-1);
    });
  });

  describe('#levelFromArray', () => {
    const loglevel = new Loglevel('trace');

    it('returns top level from array of levels', () => {
      expect(loglevel.levelFromArray(['trace'])).to.equal('trace');
    });

    it('returns null if empty array', () => {
      expect(loglevel.levelFromArray([])).to.equal(null);
    });

    it('returns highest level', () => {
      expect(loglevel.levelFromArray(['fatal', 'trace', 'off'])).to.equal('fatal');
    });

    it('returns null if argument is null', () => {
      expect(loglevel.levelFromArray(null)).to.equal(null);
    });

    it('returns null if argument is not an array', () => {
      expect(loglevel.levelFromArray({
        level: 'off'
      })).to.equal(null);
    });

    it('returns null if argument is an array with null', () => {
      expect(loglevel.levelFromArray([null])).to.equal(null);
    });

    it('returns level if argument is an array that contains null', () => {
      expect(loglevel.levelFromArray(['trace', null])).to.equal('trace');
    });
  });

  describe('#compare', () => {
    const loglevel = new Loglevel('trace');

    it('returns level int if greater than minimum level', () => {
      expect(loglevel.compare('trace', -1)).to.equal(0);
    });

    it('returns -1 if level not found', () => {
      expect(loglevel.compare('ysnp', 16)).to.equal(-1);
    });

    it('returns -1 if level is less than minimum level', () => {
      expect(loglevel.compare('debug', 8)).to.equal(-1);
    });

    it('returns -1 if level is null', () => {
      expect(loglevel.compare(null, 0)).to.equal(-1);
    });
  });

  describe('#important', () => {

    it('returns in true callback if level is greater than minimum level', () => {
      const loglevel = new Loglevel('error');
      loglevel.important('warn', 'trace', (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(true);
      });
    });

    it('returns in false callback if level is less than minimum level', () => {
      const loglevel = new Loglevel('error');
      loglevel.important('trace', 'warn', (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
      });
    });

    it('takes only level as argument', () => {
      const loglevel = new Loglevel('error');
      const fn = () => {
        loglevel.important('trace');
      };
      expect(fn).to.not.throw();
    });

    it('does not throw if only callback as argument, dont see the point though', () => {
      const loglevel = new Loglevel('error');
      const fn = () => {
        loglevel.important(() => {});
      };
      expect(fn).to.not.throw();
    });

    it('takes minimum level from constructor if not passed as argument', () => {
      const loglevel = new Loglevel('error');
      loglevel.important('trace', (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
      });
    });

    it('returns false in callback if no level', () => {
      const loglevel = new Loglevel('error');
      loglevel.important(null, (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
      });
    });

    it('returns true in callback if no minumum level in ctor', () => {
      const loglevel = new Loglevel();
      loglevel.important('trace', (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(true);
      });
    });

    it('returns false in callback if argument is off', () => {
      const loglevel = new Loglevel('trace');
      loglevel.important('off', (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
      });
    });

    it('returns false in callback if minimum level is off', () => {
      const loglevel = new Loglevel('off');
      loglevel.important('fatal', (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
      });
    });

    it('takes array as level argument', () => {
      const loglevel = new Loglevel('debug');
      loglevel.important(['fatal'], (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(true);
      });
    });

    it('resolves to highest level if passed array as level argument', () => {
      const loglevel = new Loglevel('debug');
      loglevel.important(['fatal', 'info', 'trace'], (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(true);
      });
    });

    it('if passed array returns highest level in callback as level argument', () => {
      const loglevel = new Loglevel('debug');
      loglevel.important(['fatal', 'info', 'trace'], (err, logthis, toplevel) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(true);
        expect(toplevel).to.equal('fatal');
      });
    });

    it('returns highest level in callback as toplevel', () => {
      const loglevel = new Loglevel('debug');
      loglevel.important(['Fatal', 'info', 'trace'], 'warn', (err, logthis, toplevel) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(true);
        expect(toplevel).to.equal('fatal');
      });
    });

    it('returns highest level in callback as toplevel - in lowercase', () => {
      const loglevel = new Loglevel('debug');
      loglevel.important('Fatal', (err, logthis, toplevel) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(true);
        expect(toplevel).to.equal('fatal');
      });
    });

    it('ignores custom minimum level if not found', () => {
      const loglevel = new Loglevel('debug');
      loglevel.important(['fatal', 'info', 'trace'], 'ysnp', (err, logthis, toplevel) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(true);
        expect(toplevel).to.equal('fatal');
      });
    });

    it('returns highest level in callback even if not enough', () => {
      const loglevel = new Loglevel('warn');
      loglevel.important(['info', 'trace'], (err, logthis, toplevel) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
        expect(toplevel).to.equal('info');
      });
    });

    it('with custom levels returns highest level in callback as toplevel', () => {
      const levels = {
        no: -2,
        none: -1,
        a: 1,
        b: 2,
        c: 3
      };
      const loglevel = new Loglevel('b', levels);
      loglevel.important(['fatal', 'info', 'b'], (err, logthis, toplevel) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(true);
        expect(toplevel).to.equal('b');
      });
    });

    it('with custom levels returns in false callback if default level is less than 0', () => {
      const levels = {
        no: -2,
        none: -1,
        a: 1,
        b: 2,
        c: 3
      };
      const loglevel = new Loglevel('no', levels);
      loglevel.important('c', (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
      });
    });

    it('with custom levels returns in true in callback even if casing is wrong', () => {
      const levels = {
        no: -2,
        none: -1,
        a: 1,
        b: 2,
        C: 3
      };
      const loglevel = new Loglevel('a', levels);
      loglevel.important('c', (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(true);
      });
    });

    it('with deleted levels property reverts to default levels', () => {
      const loglevel = new Loglevel('warn');
      delete loglevel.levels;

      loglevel.important('info', (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
      });
    });

    it('level argument is object returns false', () => {
      const loglevel = new Loglevel('warn');
      loglevel.important({}, (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
      });
    });

    it('level argument is array of objects returns false', () => {
      const loglevel = new Loglevel('warn');
      loglevel.important([{}, {}

      ], (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
      });
    });

    // Not sure about the expected behavior...
    it('level argument is array that contains off returns false', {
      skip: true
    }, () => {
      const loglevel = new Loglevel('warn');
      loglevel.important(['fatal', 'off'], (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
      });
    });
  });

  describe('#importantSync', () => {
    it('returns in true if level is greater than minimum level', () => {
      const loglevel = new Loglevel('error');
      expect(loglevel.importantSync('warn', 'trace')).to.equal(true);
    });

    it('custom minumum level affects result', () => {
      const loglevel = new Loglevel('info');
      expect(loglevel.importantSync(['info'], 'warn')).to.equal(false);
      expect(loglevel.importantSync(['trace'], 'trace')).to.equal(true);
    });

    it('ignores custom minimum level if not found', () => {
      const loglevel = new Loglevel('debug');
      expect(loglevel.importantSync(['fatal', 'info', 'trace'], 'ysnp')).to.equal(true);
    });

    it('returns false if minLevel is not a string', () => {
      const loglevel = new Loglevel('debug');
      expect(loglevel.importantSync(['fatal', 'info', 'trace'], 0)).to.equal(false);
    });

    it('returns level is an empty array', () => {
      const loglevel = new Loglevel('debug');
      expect(loglevel.importantSync([], 'trace')).to.equal(false);
    });
  });

  describe('#getMinimumLevel', () => {
    it('returns lowest level', () => {
      const loglevel = new Loglevel('warn');
      expect(loglevel.getMinimumLevel({
        'info': 0,
        'trace': 1
      })).to.equal('info');
    });

    it('returns "trace" if argument is not an object', () => {
      const loglevel = new Loglevel('warn');
      expect(loglevel.getMinimumLevel([])).to.equal('trace');
    });

    it('returns "trace" if argument is null', () => {
      const loglevel = new Loglevel('warn');
      expect(loglevel.getMinimumLevel(null)).to.equal('trace');
    });

    it('returns "trace" if argument is empty object', () => {
      const loglevel = new Loglevel('warn');
      expect(loglevel.getMinimumLevel({})).to.equal('trace');
    });

    it('returns "trace" if argument is a function', () => {
      const loglevel = new Loglevel('warn');
      expect(loglevel.getMinimumLevel(() => {})).to.equal('trace');
    });

    it('ignores level that is not finite', () => {
      const loglevel = new Loglevel('warn');
      expect(loglevel.getMinimumLevel({
        'info': 0,
        'trace': 1,
        'not-finite': 'bla'
      })).to.equal('info');
    });
  });

  describe('#setLevels', () => {
    it('saves levels in property levels', () => {
      const loglevel = new Loglevel('warn');
      const levels = {
        'info': 0,
        'trace': 1
      };
      loglevel.setLevels(levels);
      expect(loglevel.levels).to.only.equal(levels);
    });

    it('ignores levels that are not finite', () => {
      const loglevel = new Loglevel('warn');
      const levels = {
        'info': 0,
        'trace': 1,
        'not-finite': 'bla'
      };
      loglevel.setLevels(levels);
      expect(loglevel.levels).to.only.equal({
        'info': 0,
        'trace': 1
      });
    });

    it('ignores levels argument if null', () => {
      const loglevel = new Loglevel('warn');
      const oLevels = loglevel.levels;
      loglevel.setLevels(null);
      expect(loglevel.levels).to.only.equal(oLevels);
    });

    it('ignores levels argument if function', () => {
      const loglevel = new Loglevel('warn');
      const oLevels = loglevel.levels;
      loglevel.setLevels(() => {});
      expect(loglevel.levels).to.only.equal(oLevels);
    });

    it('with empty object returns false when testing importance', () => {
      const loglevel = new Loglevel('warn');
      loglevel.setLevels({});
      loglevel.important('fatal', (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
      });
    });

    it('ignores case of level keys', () => {
      const loglevel = new Loglevel('warn');
      loglevel.setLevels({
        none: -2,
        trace: 0,
        TRACE: 1,
        tracE: 2,
        information: 3
      });
      expect(loglevel.levels).to.only.equal({
        none: -2,
        trace: 2,
        information: 3
      });
    });

    it('ignores level that is null', () => {
      const loglevel = new Loglevel('warn');
      loglevel.setLevels({
        'info': 0,
        'trace': 1,
        'null': null
      });
      expect(loglevel.levels).to.only.equal({
        info: 0,
        trace: 1
      });
    });

    // Not sure about the expected behavior...
    it('sets new minLevel if level not found', {
      skip: true
    }, () => {
      const loglevel = new Loglevel('warn');
      const levels = {
        'info': 0,
        'trace': 1,
        'none': -1
      };
      loglevel.setLevels(levels);
      expect(loglevel.levels).to.equal({
        'info': 0,
        'trace': 1,
        'none': -1
      });
      expect(loglevel.level).to.equal('info');
    });

  });
});
