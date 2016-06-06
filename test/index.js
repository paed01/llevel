'use strict';

const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const expect = Code.expect;

const Loglevel = require('../index');

lab.experiment('llevel', () => {

  lab.experiment('#ctor', () => {

    lab.test('throws if not instantiated with new', (done) => {
      function fn() {
        /*eslint new-cap:0 */
        Loglevel();
      }
      expect(fn).to.throw(Error, 'Llevel must be instantiated using new');
      done();
    });

    lab.test('takes level as argument', (done) => {
      const ll = new Loglevel('trace');
      expect(ll.level).to.equal('trace');
      done();
    });

    lab.test('without argument returns lowest level', (done) => {
      const ll = new Loglevel();
      expect(ll.level).to.equal('trace');
      done();
    });

    lab.test('with level not in levels returns lowest level', (done) => {
      const ll = new Loglevel('ysnp');
      expect(ll.level).to.equal('trace');
      done();
    });

    lab.test('support custom levels', (done) => {
      const levels = {
        ysnp: 0
      };
      const ll = new Loglevel('ysnp', levels);
      expect(ll.level).to.equal('ysnp');
      done();
    });

    lab.test('ignores custom levels that is not an object', (done) => {
      const levels = [];
      const ll = new Loglevel('ysnp', levels);
      expect(ll.level).to.equal('trace');
      done();
    });

    lab.test('ignores custom level that is not finite', (done) => {
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
      done();
    });

    lab.test('with custom levels resolves the lowest level >0 as default', (done) => {
      const levels = {
        none: -1,
        warning: 0,
        important: 10000
      };
      const ll = new Loglevel(null, levels);
      expect(ll.level).to.equal('warning');
      done();
    });

    lab.test('takes custom levels as first argument', (done) => {
      const levels = {
        none: -1,
        warning: 0
      };
      const ll = new Loglevel(levels);
      expect(ll.level).to.equal('warning');
      done();
    });

    lab.test('ignores null as custom levels', (done) => {
      const ll = new Loglevel(null, null);
      expect(ll.level).to.equal('trace');
      done();
    });

    lab.test('ignores function as custom levels', (done) => {
      const ll = new Loglevel(null, () => {});
      expect(ll.level).to.equal('trace');
      done();
    });
  });

  lab.experiment('#resolve', () => {
    const loglevel = new Loglevel('trace');

    lab.test('resolves level to corresponding int', (done) => {
      expect(loglevel.resolve('trace')).to.equal(0);
      done();
    });

    lab.test('resolves level to corresponding int case-insensitive', (done) => {
      expect(loglevel.resolve('WARN')).to.equal(4);
      done();
    });

    lab.test('returns -1 if not a string', (done) => {
      expect(loglevel.resolve(0)).to.equal(-1);
      done();
    });

    lab.test('returns -1 if null', (done) => {
      expect(loglevel.resolve(null)).to.equal(-1);
      done();
    });

    lab.test('returns -1 if not found', (done) => {
      expect(loglevel.resolve('ysnp')).to.equal(-1);
      done();
    });
  });

  lab.experiment('#levelFromArray', () => {
    const loglevel = new Loglevel('trace');

    lab.test('returns top level from array of levels', (done) => {
      expect(loglevel.levelFromArray(['trace'])).to.equal('trace');
      done();
    });

    lab.test('returns null if empty array', (done) => {
      expect(loglevel.levelFromArray([])).to.equal(null);
      done();
    });

    lab.test('returns highest level', (done) => {
      expect(loglevel.levelFromArray(['fatal', 'trace', 'off'])).to.equal('fatal');
      done();
    });

    lab.test('returns null if argument is null', (done) => {
      expect(loglevel.levelFromArray(null)).to.equal(null);
      done();
    });

    lab.test('returns null if argument is not an array', (done) => {
      expect(loglevel.levelFromArray({
        level: 'off'
      })).to.equal(null);
      done();
    });

    lab.test('returns null if argument is an array with null', (done) => {
      expect(loglevel.levelFromArray([null])).to.equal(null);
      done();
    });

    lab.test('returns level if argument is an array that contains null', (done) => {
      expect(loglevel.levelFromArray(['trace', null])).to.equal('trace');
      done();
    });
  });

  lab.experiment('#compare', () => {
    const loglevel = new Loglevel('trace');

    lab.test('returns level int if greater than minimum level', (done) => {
      expect(loglevel.compare('trace', -1)).to.equal(0);
      done();
    });

    lab.test('returns -1 if level not found', (done) => {
      expect(loglevel.compare('ysnp', 16)).to.equal(-1);
      done();
    });

    lab.test('returns -1 if level is less than minimum level', (done) => {
      expect(loglevel.compare('debug', 8)).to.equal(-1);
      done();
    });

    lab.test('returns -1 if level is null', (done) => {
      expect(loglevel.compare(null, 0)).to.equal(-1);
      done();
    });
  });

  lab.experiment('#important', () => {

    lab.test('returns in true callback if level is greater than minimum level', (done) => {
      const loglevel = new Loglevel('error');
      loglevel.important('warn', 'trace', (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(true);
        done();
      });
    });

    lab.test('returns in false callback if level is less than minimum level', (done) => {
      const loglevel = new Loglevel('error');
      loglevel.important('trace', 'warn', (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
        done();
      });
    });

    lab.test('takes only level as argument', (done) => {
      const loglevel = new Loglevel('error');
      const fn = () => {
        loglevel.important('trace');
      };
      expect(fn).to.not.throw();
      done();
    });

    lab.test('does not throw if only callback as argument, dont see the point though', (done) => {
      const loglevel = new Loglevel('error');
      const fn = () => {
        loglevel.important(() => {});
      };
      expect(fn).to.not.throw();
      done();
    });

    lab.test('takes minimum level from constructor if not passed as argument', (done) => {
      const loglevel = new Loglevel('error');
      loglevel.important('trace', (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
        done();
      });
    });

    lab.test('returns false in callback if no level', (done) => {
      const loglevel = new Loglevel('error');
      loglevel.important(null, (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
        done();
      });
    });

    lab.test('returns true in callback if no minumum level in ctor', (done) => {
      const loglevel = new Loglevel();
      loglevel.important('trace', (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(true);
        done();
      });
    });

    lab.test('returns false in callback if argument is off', (done) => {
      const loglevel = new Loglevel('trace');
      loglevel.important('off', (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
        done();
      });
    });

    lab.test('returns false in callback if minimum level is off', (done) => {
      const loglevel = new Loglevel('off');
      loglevel.important('fatal', (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
        done();
      });
    });

    lab.test('takes array as level argument', (done) => {
      const loglevel = new Loglevel('debug');
      loglevel.important(['fatal'], (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(true);
        done();
      });
    });

    lab.test('resolves to highest level if passed array as level argument', (done) => {
      const loglevel = new Loglevel('debug');
      loglevel.important(['fatal', 'info', 'trace'], (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(true);
        done();
      });
    });

    lab.test('if passed array returns highest level in callback as level argument', (done) => {
      const loglevel = new Loglevel('debug');
      loglevel.important(['fatal', 'info', 'trace'], (err, logthis, toplevel) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(true);
        expect(toplevel).to.equal('fatal');
        done();
      });
    });

    lab.test('returns highest level in callback as toplevel', (done) => {
      const loglevel = new Loglevel('debug');
      loglevel.important(['Fatal', 'info', 'trace'], 'warn', (err, logthis, toplevel) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(true);
        expect(toplevel).to.equal('fatal');
        done();
      });
    });

    lab.test('returns highest level in callback as toplevel - in lowercase', (done) => {
      const loglevel = new Loglevel('debug');
      loglevel.important('Fatal', (err, logthis, toplevel) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(true);
        expect(toplevel).to.equal('fatal');
        done();
      });
    });

    lab.test('ignores custom minimum level if not found', (done) => {
      const loglevel = new Loglevel('debug');
      loglevel.important(['fatal', 'info', 'trace'], 'ysnp', (err, logthis, toplevel) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(true);
        expect(toplevel).to.equal('fatal');
        done();
      });
    });

    lab.test('returns highest level in callback even if not enough', (done) => {
      const loglevel = new Loglevel('warn');
      loglevel.important(['info', 'trace'], (err, logthis, toplevel) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
        expect(toplevel).to.equal('info');
        done();
      });
    });

    lab.test('with custom levels returns highest level in callback as toplevel', (done) => {
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
        done();
      });
    });

    lab.test('with custom levels returns in false callback if default level is less than 0', (done) => {
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
        done();
      });
    });

    lab.test('with custom levels returns in true in callback even if casing is wrong', (done) => {
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
        done();
      });
    });

    lab.test('with deleted levels property reverts to default levels', (done) => {
      const loglevel = new Loglevel('warn');
      delete loglevel.levels;

      loglevel.important('info', (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
        done();
      });
    });

    lab.test('level argument is object returns false', (done) => {
      const loglevel = new Loglevel('warn');
      loglevel.important({}, (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
        done();
      });
    });

    lab.test('level argument is array of objects returns false', (done) => {
      const loglevel = new Loglevel('warn');
      loglevel.important([{}, {}

      ], (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
        done();
      });
    });

    // Not sure about the expected behavior...
    lab.test('level argument is array that contains off returns false', {
      skip: true
    }, (done) => {
      const loglevel = new Loglevel('warn');
      loglevel.important(['fatal', 'off'], (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
        done();
      });
    });
  });

  lab.experiment('#importantSync', () => {
    lab.test('returns in true if level is greater than minimum level', (done) => {
      const loglevel = new Loglevel('error');
      expect(loglevel.importantSync('warn', 'trace')).to.equal(true);
      done();
    });

    lab.test('custom minumum level affects result', (done) => {
      const loglevel = new Loglevel('info');
      expect(loglevel.importantSync(['info'], 'warn')).to.equal(false);
      expect(loglevel.importantSync(['trace'], 'trace')).to.equal(true);
      done();
    });

    lab.test('ignores custom minimum level if not found', (done) => {
      const loglevel = new Loglevel('debug');
      expect(loglevel.importantSync(['fatal', 'info', 'trace'], 'ysnp')).to.equal(true);
      done();
    });

    lab.test('returns false if minLevel is not a string', (done) => {
      const loglevel = new Loglevel('debug');
      expect(loglevel.importantSync(['fatal', 'info', 'trace'], 0)).to.equal(false);
      done();
    });

    lab.test('returns level is an empty array', (done) => {
      const loglevel = new Loglevel('debug');
      expect(loglevel.importantSync([], 'trace')).to.equal(false);
      done();
    });
  });

  lab.experiment('#getMinimumLevel', () => {
    lab.test('returns lowest level', (done) => {
      const loglevel = new Loglevel('warn');
      expect(loglevel.getMinimumLevel({
        'info': 0,
        'trace': 1
      })).to.equal('info');
      done();
    });

    lab.test('returns "trace" if argument is not an object', (done) => {
      const loglevel = new Loglevel('warn');
      expect(loglevel.getMinimumLevel([])).to.equal('trace');
      done();
    });

    lab.test('returns "trace" if argument is null', (done) => {
      const loglevel = new Loglevel('warn');
      expect(loglevel.getMinimumLevel(null)).to.equal('trace');
      done();
    });

    lab.test('returns "trace" if argument is empty object', (done) => {
      const loglevel = new Loglevel('warn');
      expect(loglevel.getMinimumLevel({})).to.equal('trace');
      done();
    });

    lab.test('returns "trace" if argument is a function', (done) => {
      const loglevel = new Loglevel('warn');
      expect(loglevel.getMinimumLevel(() => {})).to.equal('trace');
      done();
    });

    lab.test('ignores level that is not finite', (done) => {
      const loglevel = new Loglevel('warn');
      expect(loglevel.getMinimumLevel({
        'info': 0,
        'trace': 1,
        'not-finite': 'bla'
      })).to.equal('info');
      done();
    });
  });

  lab.experiment('#setLevels', () => {
    lab.test('saves levels in property levels', (done) => {
      const loglevel = new Loglevel('warn');
      const levels = {
        'info': 0,
        'trace': 1
      };
      loglevel.setLevels(levels);
      expect(loglevel.levels).to.only.equal(levels);
      done();
    });

    lab.test('ignores levels that are not finite', (done) => {
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
      done();
    });

    lab.test('ignores levels argument if null', (done) => {
      const loglevel = new Loglevel('warn');
      const oLevels = loglevel.levels;
      loglevel.setLevels(null);
      expect(loglevel.levels).to.only.equal(oLevels);
      done();
    });

    lab.test('ignores levels argument if function', (done) => {
      const loglevel = new Loglevel('warn');
      const oLevels = loglevel.levels;
      loglevel.setLevels(() => {});
      expect(loglevel.levels).to.only.equal(oLevels);
      done();
    });

    lab.test('with empty object returns false when testing importance', (done) => {
      const loglevel = new Loglevel('warn');
      loglevel.setLevels({});
      loglevel.important('fatal', (err, logthis) => {
        expect(err).to.not.exist();
        expect(logthis).to.equal(false);
        done();
      });
    });

    lab.test('ignores case of level keys', (done) => {
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
      done();
    });

    lab.test('ignores level that is null', (done) => {
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
      done();
    });

    // Not sure about the expected behavior...
    lab.test('sets new minLevel if level not found', {
      skip: true
    }, (done) => {
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
      done();
    });

  });
});
