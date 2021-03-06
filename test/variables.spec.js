describe('variables', function() {
    let snap2js = require('..'),
        assert = require('assert'),
        utils = require('./utils'),
        content;

    describe('initial values', function() {
        var bin,
            cxt,
            values;

        before(function() {
            content = utils.getProjectXml('initial-variables');
            cxt = snap2js.newContext();

            values = [];
            cxt['bubble'] = value => values.push(value);
            bin = snap2js.compile(content);
            bin(cxt);
        });

        it('should first say 14', function() {
            assert.equal(values[0], 14);
        });

        it('should second say list 1,2,3', function() {
            assert.equal(values[1][0], 1);
            assert.equal(values[1][1], 2);
            assert.equal(values[1][2], 3);
        });

        it('should load variables with double quotes', function() {
            let content = utils.getContextXml('quote-var-val');
            cxt = snap2js.newContext();
            bin = snap2js.compile(content);
            // This was throwing an exception before issue #56
            bin(cxt);
        });

        it('should load variables with block values', async function() {
            await utils.compileAndRun('initial-var-fn')
            cxt = snap2js.newContext();
        });
    });

    describe('basic blocks', function() {
        before(function(){
            content = utils.getProjectXml('variables');
        });

        describe('transpile', function() {
            var code;

            before(function() {
                code = snap2js.transpile(content);
            });

            it('should contain "doSetVar"', function() {
                assert(/\bdoSetVar\b/.test(code));
            });

            it('should contain "doChangeVar"', function() {
                assert(/\bdoChangeVar\b/.test(code));
            });
        });

        describe('compile', function() {
            var bin,
                cxt,
                xVal = 0;

            before(function() {
                cxt = snap2js.newContext();
                cxt['setXPosition'] = v => xVal = v;
                cxt['changeXPosition'] = v => xVal += v;

                bin = snap2js.compile(content);
            });

            it('should set a to 12', function(done) {
                cxt['doSetVar'] = (name, v) => {
                    if (name === 'a' && v === '14') done();
                };
                bin(cxt);
            });
        });
    });

    describe('nested lists', function() {
        let result;

        before(done => {
            content = utils.getProjectXml('nested-lists');
            const cxt = snap2js.newContext();
            const bin = snap2js.compile(content);
            cxt['bubble'] = val => {
                console.log('value', val);
                result = val;
                done();
            };
            bin(cxt);
        });

        it('should parse string value', function() {
            assert.equal(result[0], '1');
        });

        it('should parse nested list values', function() {
            assert.equal(result[1][0], '2');
            assert.equal(result[1][1], '3');
        });

        it('should parse nested x2 list values', function() {
            assert.equal(result[1][2][0], '4');
        });
    });

    describe('cons/cdr', function() {
        before(function() {
            content = utils.getProjectXml('cons-cdr');
            var cxt = snap2js.newContext();
            var bin = snap2js.compile(content);
            cxt['doReport'] = val => result = val;
            bin(cxt);
        });

        it('should parse cdr', function() {
            assert.equal(result[0], '5');
            assert.equal(result[1], '6');
            assert.equal(result[2], '7');
        });

    });

    describe('all blocks', function() {
        var result,
            cxt;

        before(function() {
            content = utils.getProjectXml('all-variables');
            var bin = snap2js.compile(content)
            cxt = snap2js.newContext();
            cxt['doReport'] = val => result = val;
            bin(cxt);
        });

        it('should set cat to 11', function() {
            assert.equal(result[5], 11);
        });

        it('should return length of list', function() {
            assert.equal(result[4], 4);
        });

        it('should check list containment', function() {
            assert.equal(result[3], true);
        });

        it('should get cdr', function() {
            var cdr = result[2];
            assert.equal(cdr[0], 4);
            assert.equal(cdr[1], 5);
            assert.equal(cdr[2], 3);
        });

        it('should item by index', function() {
            assert.equal(result[1], 2);
        });

        it('should compile v6 blocks', function() {
            const content = utils.getProjectXml('all-variablesv2');
            snap2js.compile(content)
        });
    });

    describe('include global vars in ctx', function() {
        let list;

        before(async function() {
            const content = utils.getContextXml('global-vars-with-ctx');
            const bin = snap2js.compile(content)
            const cxt = snap2js.newContext();
            const fn = bin(cxt);
            list = await fn();
        });

        it('should support script vars', function() {
            assert.equal(list[0], 'set a script variable!');
        });

        it('should support sprite vars', function() {
            assert.equal(list[1], 'I am a sprite variable!');
        });

        it('should support global vars', function() {
            assert.equal(list[2], 'I am a global variable!');
        });
    });
});
