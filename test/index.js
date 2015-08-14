'use strict';

var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var expect = Code.expect;

var Loglevel = require('../index');

lab.experiment('llevel', function() {

    lab.experiment('#ctor', function() {

        lab.test('throws if not instantiated with new', function(done) {
            var fn = function() {
                /*eslint new-cap:0 */
                Loglevel();
            };
            expect(fn).to.throw(Error, 'Llevel must be instantiated using new');
            done();
        });

        lab.test('takes level as argument', function(done) {
            var ll = new Loglevel('trace');
            expect(ll.level).to.equal('trace');
            done();
        });

        lab.test('without argument returns lowest level', function(done) {
            var ll = new Loglevel();
            expect(ll.level).to.equal('trace');
            done();
        });

        lab.test('with level not in levels returns lowest level', function(done) {
            var ll = new Loglevel('ysnp');
            expect(ll.level).to.equal('trace');
            done();
        });

        lab.test('support custom levels', function(done) {
            var levels = {
                ysnp: 0
            };
            var ll = new Loglevel('ysnp', levels);
            expect(ll.level).to.equal('ysnp');
            done();
        });

        lab.test('ignores custom levels that is not an object', function(done) {
            var levels = [];
            var ll = new Loglevel('ysnp', levels);
            expect(ll.level).to.equal('trace');
            done();
        });

        lab.test('ignores custom level that is not finite', function(done) {
            var levels = {
                none: -1,
                warning: 0,
                string: 'me'
            };
            var ll = new Loglevel('warning', levels);
            expect(ll.levels).to.deep.equal({
                none: -1,
                warning: 0
            });
            done();
        });

        lab.test('with custom levels resolves the lowest level >0 as default', function(done) {
            var levels = {
                none: -1,
                warning: 0,
                important: 10000
            };
            var ll = new Loglevel(null, levels);
            expect(ll.level).to.equal('warning');
            done();
        });

        lab.test('takes custom levels as first argument', function(done) {
            var levels = {
                none: -1,
                warning: 0
            };
            var ll = new Loglevel(levels);
            expect(ll.level).to.equal('warning');
            done();
        });

        lab.test('ignores null as custom levels', function(done) {
            var ll = new Loglevel(null, null);
            expect(ll.level).to.equal('trace');
            done();
        });

        lab.test('ignores function as custom levels', function(done) {
            var ll = new Loglevel(null, function() {});
            expect(ll.level).to.equal('trace');
            done();
        });
    });

    lab.experiment('#resolve', function() {
        var loglevel = new Loglevel('trace');

        lab.test('resolves level to corresponding int', function(done) {
            expect(loglevel.resolve('trace')).to.equal(0);
            done();
        });

        lab.test('resolves level to corresponding int case-insensitive', function(done) {
            expect(loglevel.resolve('WARN')).to.equal(4);
            done();
        });

        lab.test('returns -1 if not a string', function(done) {
            expect(loglevel.resolve(0)).to.equal(-1);
            done();
        });

        lab.test('returns -1 if null', function(done) {
            expect(loglevel.resolve(null)).to.equal(-1);
            done();
        });

        lab.test('returns -1 if not found', function(done) {
            expect(loglevel.resolve('ysnp')).to.equal(-1);
            done();
        });
    });

    lab.experiment('#levelFromArray', function() {
        var loglevel = new Loglevel('trace');

        lab.test('returns top level from array of levels', function(done) {
            expect(loglevel.levelFromArray(['trace'])).to.equal('trace');
            done();
        });

        lab.test('returns null if empty array', function(done) {
            expect(loglevel.levelFromArray([])).to.equal(null);
            done();
        });

        lab.test('returns highest level', function(done) {
            expect(loglevel.levelFromArray(['fatal', 'trace', 'off'])).to.equal('fatal');
            done();
        });

        lab.test('returns null if argument is null', function(done) {
            expect(loglevel.levelFromArray(null)).to.equal(null);
            done();
        });

        lab.test('returns null if argument is not an array', function(done) {
            expect(loglevel.levelFromArray({
                level: 'off'
            })).to.equal(null);
            done();
        });

        lab.test('returns null if argument is an array with null', function(done) {
            expect(loglevel.levelFromArray([null])).to.equal(null);
            done();
        });

        lab.test('returns level if argument is an array that contains null', function(done) {
            expect(loglevel.levelFromArray(['trace', null])).to.equal('trace');
            done();
        });
    });

    lab.experiment('#compare', function() {
        var loglevel = new Loglevel('trace');

        lab.test('returns level int if greater than minimum level', function(done) {
            expect(loglevel.compare('trace', -1)).to.equal(0);
            done();
        });

        lab.test('returns -1 if level not found', function(done) {
            expect(loglevel.compare('ysnp', 16)).to.equal(-1);
            done();
        });

        lab.test('returns -1 if level is less than minimum level', function(done) {
            expect(loglevel.compare('debug', 8)).to.equal(-1);
            done();
        });

        lab.test('returns -1 if level is null', function(done) {
            expect(loglevel.compare(null, 0)).to.equal(-1);
            done();
        });
    });

    lab.experiment('#important', function() {

        lab.test('returns in true callback if level is greater than minimum level', function(done) {
            var loglevel = new Loglevel('error');
            loglevel.important('warn', 'trace', function(err, logthis) {
                expect(err).to.not.exist();
                expect(logthis).to.equal(true);
                done();
            });
        });

        lab.test('returns in false callback if level is less than minimum level', function(done) {
            var loglevel = new Loglevel('error');
            loglevel.important('trace', 'warn', function(err, logthis) {
                expect(err).to.not.exist();
                expect(logthis).to.equal(false);
                done();
            });
        });

        lab.test('takes only level as argument', function(done) {
            var loglevel = new Loglevel('error');
            var fn = function() {
                loglevel.important('trace');
            };
            expect(fn).to.not.throw();
            done();
        });

        lab.test('does not throw if only callback as argument, dont see the point though', function(done) {
            var loglevel = new Loglevel('error');
            var fn = function() {
                loglevel.important(function() {});
            };
            expect(fn).to.not.throw();
            done();
        });

        lab.test('takes minimum level from constructor if not passed as argument', function(done) {
            var loglevel = new Loglevel('error');
            loglevel.important('trace', function(err, logthis) {
                expect(err).to.not.exist();
                expect(logthis).to.equal(false);
                done();
            });
        });

        lab.test('returns false in callback if no level', function(done) {
            var loglevel = new Loglevel('error');
            loglevel.important(null, function(err, logthis) {
                expect(err).to.not.exist();
                expect(logthis).to.equal(false);
                done();
            });
        });

        lab.test('returns true in callback if no minumum level in ctor', function(done) {
            var loglevel = new Loglevel();
            loglevel.important('trace', function(err, logthis) {
                expect(err).to.not.exist();
                expect(logthis).to.equal(true);
                done();
            });
        });

        lab.test('returns false in callback if argument is off', function(done) {
            var loglevel = new Loglevel('trace');
            loglevel.important('off', function(err, logthis) {
                expect(err).to.not.exist();
                expect(logthis).to.equal(false);
                done();
            });
        });

        lab.test('returns false in callback if minimum level is off', function(done) {
            var loglevel = new Loglevel('off');
            loglevel.important('fatal', function(err, logthis) {
                expect(err).to.not.exist();
                expect(logthis).to.equal(false);
                done();
            });
        });

        lab.test('takes array as level argument', function(done) {
            var loglevel = new Loglevel('debug');
            loglevel.important(['fatal'], function(err, logthis) {
                expect(err).to.not.exist();
                expect(logthis).to.equal(true);
                done();
            });
        });

        lab.test('resolves to highest level if passed array as level argument', function(done) {
            var loglevel = new Loglevel('debug');
            loglevel.important(['fatal', 'info', 'trace'], function(err, logthis) {
                expect(err).to.not.exist();
                expect(logthis).to.equal(true);
                done();
            });
        });

        lab.test('if passed array returns highest level in callback as level argument', function(done) {
            var loglevel = new Loglevel('debug');
            loglevel.important(['fatal', 'info', 'trace'], function(err, logthis, toplevel) {
                expect(err).to.not.exist();
                expect(logthis).to.equal(true);
                expect(toplevel).to.equal('fatal');
                done();
            });
        });

        lab.test('returns highest level in callback as toplevel', function(done) {
            var loglevel = new Loglevel('debug');
            loglevel.important(['fatal', 'info', 'trace'], 'warn', function(err, logthis, toplevel) {
                expect(err).to.not.exist();
                expect(logthis).to.equal(true);
                expect(toplevel).to.equal('fatal');
                done();
            });
        });

        lab.test('ignores custom minimum level if not found', function(done) {
            var loglevel = new Loglevel('debug');
            loglevel.important(['fatal', 'info', 'trace'], 'ysnp', function(err, logthis, toplevel) {
                expect(err).to.not.exist();
                expect(logthis).to.equal(true);
                expect(toplevel).to.equal('fatal');
                done();
            });
        });

        lab.test('returns highest level in callback even if not enough', function(done) {
            var loglevel = new Loglevel('warn');
            loglevel.important(['info', 'trace'], function(err, logthis, toplevel) {
                expect(err).to.not.exist();
                expect(logthis).to.equal(false);
                expect(toplevel).to.equal('info');
                done();
            });
        });

        lab.test('with custom levels returns highest level in callback as toplevel', function(done) {
            var levels = {
                no: -2,
                none: -1,
                a: 1,
                b: 2,
                c: 3
            };
            var loglevel = new Loglevel('b', levels);
            loglevel.important(['fatal', 'info', 'b'], function(err, logthis, toplevel) {
                expect(err).to.not.exist();
                expect(logthis).to.equal(true);
                expect(toplevel).to.equal('b');
                done();
            });
        });

        lab.test('with custom levels returns in false callback if default level is less than 0', function(done) {
            var levels = {
                no: -2,
                none: -1,
                a: 1,
                b: 2,
                c: 3
            };
            var loglevel = new Loglevel('no', levels);
            loglevel.important('c', function(err, logthis) {
                expect(err).to.not.exist();
                expect(logthis).to.equal(false);
                done();
            });
        });

        lab.test('with custom levels returns in true in callback even if casing is wrong', function(done) {
            var levels = {
                no: -2,
                none: -1,
                a: 1,
                b: 2,
                C: 3
            };
            var loglevel = new Loglevel('a', levels);
            loglevel.important('c', function(err, logthis) {
                expect(err).to.not.exist();
                expect(logthis).to.equal(true);
                done();
            });
        });

        lab.test('with deleted levels property reverts to default levels', function(done) {
            var loglevel = new Loglevel('warn');
            delete loglevel.levels;

            loglevel.important('info', function(err, logthis) {
                expect(err).to.not.exist();
                expect(logthis).to.equal(false);
                done();
            });
        });

        lab.test('level argument is object returns false', function(done) {
            var loglevel = new Loglevel('warn');
            loglevel.important({}, function(err, logthis) {
                expect(err).to.not.exist();
                expect(logthis).to.equal(false);
                done();
            });
        });

        lab.test('level argument is array of objects returns false', function(done) {
            var loglevel = new Loglevel('warn');
            loglevel.important([{}, {}

            ], function(err, logthis) {
                expect(err).to.not.exist();
                expect(logthis).to.equal(false);
                done();
            });
        });

        // Not sure about the expected behavior...
        lab.test('level argument is array that contains off returns false', {
            skip: true
        }, function(done) {
            var loglevel = new Loglevel('warn');
            loglevel.important(['fatal', 'off'], function(err, logthis) {
                expect(err).to.not.exist();
                expect(logthis).to.equal(false);
                done();
            });
        });
    });

    lab.experiment('#getMinimumLevel', function() {
        lab.test('returns lowest level', function(done) {
            var loglevel = new Loglevel('warn');
            expect(loglevel.getMinimumLevel({
                'info': 0,
                'trace': 1
            })).to.equal('info');
            done();
        });

        lab.test('returns "trace" if argument is not an object', function(done) {
            var loglevel = new Loglevel('warn');
            expect(loglevel.getMinimumLevel([])).to.equal('trace');
            done();
        });

        lab.test('returns "trace" if argument is null', function(done) {
            var loglevel = new Loglevel('warn');
            expect(loglevel.getMinimumLevel(null)).to.equal('trace');
            done();
        });

        lab.test('returns "trace" if argument is empty object', function(done) {
            var loglevel = new Loglevel('warn');
            expect(loglevel.getMinimumLevel({})).to.equal('trace');
            done();
        });

        lab.test('returns "trace" if argument is a function', function(done) {
            var loglevel = new Loglevel('warn');
            expect(loglevel.getMinimumLevel(function() {})).to.equal('trace');
            done();
        });

        lab.test('ignores level that is not finite', function(done) {
            var loglevel = new Loglevel('warn');
            expect(loglevel.getMinimumLevel({
                'info': 0,
                'trace': 1,
                'not-finite': 'bla'
            })).to.equal('info');
            done();
        });
    });

    lab.experiment('#setLevels', function() {
        lab.test('saves levels in property levels', function(done) {
            var loglevel = new Loglevel('warn');
            var levels = {
                'info': 0,
                'trace': 1
            };
            loglevel.setLevels(levels);
            expect(loglevel.levels).to.deep.equal(levels);
            done();
        });

        lab.test('ignores levels that are not finite', function(done) {
            var loglevel = new Loglevel('warn');
            var levels = {
                'info': 0,
                'trace': 1,
                'not-finite': 'bla'
            };
            loglevel.setLevels(levels);
            expect(loglevel.levels).to.deep.equal({
                'info': 0,
                'trace': 1
            });
            done();
        });

        lab.test('ignores levels argument if null', function(done) {
            var loglevel = new Loglevel('warn');
            var oLevels = loglevel.levels;
            loglevel.setLevels(null);
            expect(loglevel.levels).to.deep.equal(oLevels);
            done();
        });

        lab.test('ignores levels argument if function', function(done) {
            var loglevel = new Loglevel('warn');
            var oLevels = loglevel.levels;
            loglevel.setLevels(function() {});
            expect(loglevel.levels).to.deep.equal(oLevels);
            done();
        });

        lab.test('with empty object returns false when testing importance', function(done) {
            var loglevel = new Loglevel('warn');
            loglevel.setLevels({});
            loglevel.important('fatal', function(err, logthis) {
                expect(err).to.not.exist();
                expect(logthis).to.equal(false);
                done();
            });
        });

        lab.test('ignores case of level keys', function(done) {
            var loglevel = new Loglevel('warn');
            loglevel.setLevels({
                none: -2,
                trace: 0,
                TRACE: 1,
                tracE: 2,
                information: 3
            });
            expect(loglevel.levels).to.deep.equal({
                none: -2,
                trace: 2,
                information: 3
            });
            done();
        });

        lab.test('ignores level that is null', function(done) {
            var loglevel = new Loglevel('warn');
            loglevel.setLevels({
                'info': 0,
                'trace': 1,
                'null': null
            });
            expect(loglevel.levels).to.deep.equal({
                info: 0,
                trace: 1
            });
            done();
        });

        // Not sure about the expected behavior...
        lab.test('sets new minLevel if level not found', {
            skip: true
        }, function(done) {
            var loglevel = new Loglevel('warn');
            var levels = {
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
