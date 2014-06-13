/*jslint expr:true es5:true */
var Lab = require('lab');

var expect = Lab.expect;
var before = Lab.before;
var after = Lab.after;
var describe = Lab.experiment;
var it = Lab.test;

var Loglevel = require('../index');

describe('llevel', function () {

    describe('#ctor', function () {

        it('throws if not instantiated with new', function (done) {
            var fn = function () {
                Loglevel();
            };
            expect(fn).to.throw(Error);
            done();
        });

        it('takes level as argument', function (done) {
            var ll = new Loglevel('trace');
            expect(ll.level).to.eql('trace');
            done();
        });

        it('without argument returns lowest level', function (done) {
            var ll = new Loglevel();
            expect(ll.level).to.eql('trace');
            done();
        });

        it('with level not in levels returns lowest level', function (done) {
            var ll = new Loglevel('ysnp');
            expect(ll.level).to.eql('trace');
            done();
        });

        it('support custom levels', function (done) {
            var levels = {
                ysnp : 0
            };
            var ll = new Loglevel('ysnp', levels);
            expect(ll.level).to.eql('ysnp');
            done();
        });

        it('ignores custom levels that is not an object', function (done) {
            var levels = [];
            var ll = new Loglevel('ysnp', levels);
            expect(ll.level).to.eql('trace');
            done();
        });

        it('ignores custom level that is not finite', function (done) {
            var levels = {
                none : -1,
                warning : 0,
                string : 'me'
            };
            var ll = new Loglevel('warning', levels);
            expect(ll.levels).to.eql({
                none : -1,
                warning : 0
            });
            done();
        });

        it('with custom levels resolves the lowest level >0 as default', function (done) {
            var levels = {
                none : -1,
                warning : 0,
                important : 10000
            };
            var ll = new Loglevel(null, levels);
            expect(ll.level).to.eql('warning');
            done();
        });

        it('takes custom levels as first argument', function (done) {
            var levels = {
                none : -1,
                warning : 0
            };
            var ll = new Loglevel(levels);
            expect(ll.level).to.eql('warning');
            done();
        });

        it('ignores null as custom levels', function (done) {
            var ll = new Loglevel(null, null);
            expect(ll.level).to.eql('trace');
            done();
        });

        it('ignores function as custom levels', function (done) {
            var ll = new Loglevel(null, function() {});
            expect(ll.level).to.eql('trace');
            done();
        });
    });

    describe('#resolve', function () {
        var loglevel = new Loglevel('trace');

        it('resolves level to corresponding int', function (done) {
            expect(loglevel.resolve('trace')).to.eql(0);
            done();
        });

        it('resolves level to corresponding int case-insensitive', function (done) {
            expect(loglevel.resolve('WARN')).to.eql(4);
            done();
        });

        it('returns -1 if not a string', function (done) {
            expect(loglevel.resolve(0)).to.eql(-1);
            done();
        });

        it('returns -1 if null', function (done) {
            expect(loglevel.resolve(null)).to.eql(-1);
            done();
        });

        it('returns -1 if not found', function (done) {
            expect(loglevel.resolve('ysnp')).to.eql(-1);
            done();
        });
    });

    describe('#levelFromArray', function () {
        var loglevel = new Loglevel('trace');

        it('returns top level from array of levels', function (done) {
            expect(loglevel.levelFromArray(['trace'])).to.eql('trace');
            done();
        });

        it('returns null if empty array', function (done) {
            expect(loglevel.levelFromArray([])).to.eql(null);
            done();
        });

        it('returns highest level', function (done) {
            expect(loglevel.levelFromArray(['fatal', 'trace', 'off'])).to.eql('fatal');
            done();
        });

        it('returns null if argument is null', function (done) {
            expect(loglevel.levelFromArray(null)).to.eql(null);
            done();
        });

        it('returns null if argument is not an array', function (done) {
            expect(loglevel.levelFromArray({
                    level : 'off'
                })).to.eql(null);
            done();
        });
    });

    describe('#compare', function () {
        var loglevel = new Loglevel('trace');

        it('returns level int if greater than minimum level', function (done) {
            expect(loglevel.compare('trace', -1)).to.eql(0);
            done();
        });

        it('returns -1 if level not found', function (done) {
            expect(loglevel.compare('ysnp', 16)).to.eql(-1);
            done();
        });

        it('returns -1 if level is less than minimum level', function (done) {
            expect(loglevel.compare('debug', 8)).to.eql(-1);
            done();
        });
    });

    describe('#important', function () {

        it('returns in true callback if level is greater than minimum level', function (done) {
            var loglevel = new Loglevel('error');
            loglevel.important('warn', 'trace', function (err, logthis) {
                expect(err).to.not.exist;
                expect(logthis).to.eql(true);
                done();
            });
        });

        it('returns in false callback if level is less than minimum level', function (done) {
            var loglevel = new Loglevel('error');
            loglevel.important('trace', 'warn', function (err, logthis) {
                expect(err).to.not.exist;
                expect(logthis).to.eql(false);
                done();
            });
        });

        it('takes only level as argument', function (done) {
            var loglevel = new Loglevel('error');
            var fn = function () {
                loglevel.important('trace');
            };
            expect(fn).to.not.throw(Error);
            done();
        });

        it('does not throw if only callback as argument, dont see the point though', function (done) {
            var loglevel = new Loglevel('error');
            var fn = function () {
                loglevel.important(function () {});
            };
            expect(fn).to.not.throw(Error);
            done();
        });

        it('takes minimum level from constructor if not passed as argument', function (done) {
            var loglevel = new Loglevel('error');
            loglevel.important('trace', function (err, logthis) {
                expect(err).to.not.exist;
                expect(logthis).to.eql(false);
                done();
            });
        });

        it('returns false in callback if no level', function (done) {
            var loglevel = new Loglevel('error');
            loglevel.important(null, function (err, logthis) {
                expect(err).to.not.exist;
                expect(logthis).to.eql(false);
                done();
            });
        });

        it('returns true in callback if no minumum level', function (done) {
            var loglevel = new Loglevel();
            loglevel.important('trace', function (err, logthis) {
                expect(err).to.not.exist;
                expect(logthis).to.eql(true);
                done();
            });
        });

        it('returns false in callback if argument is off', function (done) {
            var loglevel = new Loglevel('trace');
            loglevel.important('off', function (err, logthis) {
                expect(err).to.not.exist;
                expect(logthis).to.eql(false);
                done();
            });
        });

        it('returns false in callback if minimum level is off', function (done) {
            var loglevel = new Loglevel('off');
            loglevel.important('fatal', function (err, logthis) {
                expect(err).to.not.exist;
                expect(logthis).to.eql(false);
                done();
            });
        });

        it('takes array as level argument', function (done) {
            var loglevel = new Loglevel('debug');
            loglevel.important(['fatal'], function (err, logthis) {
                expect(err).to.not.exist;
                expect(logthis).to.eql(true);
                done();
            });
        });

        it('resolves to highest level if passed array as level argument', function (done) {
            var loglevel = new Loglevel('debug');
            loglevel.important(['fatal', 'info', 'trace'], function (err, logthis) {
                expect(err).to.not.exist;
                expect(logthis).to.eql(true);
                done();
            });
        });

        it('if passed array returns highest level in callback as level argument', function (done) {
            var loglevel = new Loglevel('debug');
            loglevel.important(['fatal', 'info', 'trace'], function (err, logthis, toplevel) {
                expect(err).to.not.exist;
                expect(logthis).to.eql(true);
                expect(toplevel).to.eql('fatal');
                done();
            });
        });

        it('returns highest level in callback as toplevel', function (done) {
            var loglevel = new Loglevel('debug');
            loglevel.important(['fatal', 'info', 'trace'], 'warn', function (err, logthis, toplevel) {
                expect(err).to.not.exist;
                expect(logthis).to.eql(true);
                expect(toplevel).to.eql('fatal');
                done();
            });
        });

        it('ignores custom minimum level if not found', function (done) {
            var loglevel = new Loglevel('debug');
            loglevel.important(['fatal', 'info', 'trace'], 'ysnp', function (err, logthis, toplevel) {
                expect(err).to.not.exist;
                expect(logthis).to.eql(true);
                expect(toplevel).to.eql('fatal');
                done();
            });
        });

        it('returns highest level in callback even if not enough', function (done) {
            var loglevel = new Loglevel('warn');
            loglevel.important(['info', 'trace'], function (err, logthis, toplevel) {
                expect(err).to.not.exist;
                expect(logthis).to.eql(false);
                expect(toplevel).to.eql('info');
                done();
            });
        });
        
        it('with custom levels returns highest level in callback as toplevel', function (done) {
            var levels = {
                no : -2,
                none : -1,
                a : 1,
                b : 2,
                c : 3
            };
            var loglevel = new Loglevel('b', levels);
            loglevel.important(['fatal', 'info', 'b'], function (err, logthis, toplevel) {
                expect(err).to.not.exist;
                expect(logthis).to.eql(true);
                expect(toplevel).to.eql('b');
                done();
            });
        });

        it('with custom levels returns in false callback if default level is less than 0', function (done) {
            var levels = {
                no : -2,
                none : -1,
                a : 1,
                b : 2,
                c : 3
            };
            var loglevel = new Loglevel('no', levels);
            loglevel.important('c', function (err, logthis) {
                expect(err).to.not.exist;
                expect(logthis).to.eql(false);
                done();
            });
        });
        
        it('with custom levels returns in false in callback if casing is wrong', function (done) {
            var levels = {
                no : -2,
                none : -1,
                a : 1,
                b : 2,
                C : 3
            };
            var loglevel = new Loglevel('a', levels);
            loglevel.important('c', function (err, logthis) {
                expect(err).to.not.exist;
                expect(logthis).to.eql(false);
                done();
            });
        });
    });

    describe('#getMinimumLevel', function () {
        it('returns lowest level', function (done) {
            var loglevel = new Loglevel('warn');
            expect(loglevel.getMinimumLevel({
                    'info' : 0,
                    'trace' : 1
                })).to.eql('info');
            done();
        });

        it('returns "trace" if argument is not an object', function (done) {
            var loglevel = new Loglevel('warn');
            expect(loglevel.getMinimumLevel([])).to.eql('trace');
            done();
        });

        it('returns "trace" if argument is null', function (done) {
            var loglevel = new Loglevel('warn');
            expect(loglevel.getMinimumLevel(null)).to.eql('trace');
            done();
        });

        it('returns "trace" if argument is empty object', function (done) {
            var loglevel = new Loglevel('warn');
            expect(loglevel.getMinimumLevel({})).to.eql('trace');
            done();
        });

        it('returns "trace" if argument is a function', function (done) {
            var loglevel = new Loglevel('warn');
            expect(loglevel.getMinimumLevel(function () {})).to.eql('trace');
            done();
        });

        it('ignores level that is not finite', function (done) {
            var loglevel = new Loglevel('warn');
            expect(loglevel.getMinimumLevel({
                    'info' : 0,
                    'trace' : 1,
                    'not-finite' : 'bla'
                })).to.eql('info');
            done();
        });
    });

});
