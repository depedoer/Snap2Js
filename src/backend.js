// Generating the js code from the ast nodes (indexed by node type)
const indent = require('./indent');
var backend = {};

///////////////////// Motion ///////////////////// 

backend.turnRight =
backend.turnLeft =
backend.setXPosition =
backend.setYPosition =
backend.changeXPosition =
backend.changeYPosition =
backend.forward = function(node) {
    var dist = this.generateCode(node.inputs[0][0]);
    return `__ENV.${node.type}.call(this, +${dist});`;
};

///////////////////// Control ///////////////////// 
backend.doWarp = function(node) {
    console.log(node);
    // TODO
    return `__ENV.${node.type}.call(this);`;
};

backend.doWait = function(node) {
    var time = this.generateCode(node.inputs[0][0]);
    return `__ENV.${node.type}.call(this, ${time});`;
};

backend.doIfElse = function(node) {
    var cond = this.generateCode(node.inputs[0][0]),
        ifTrue = this.generateCode(node.inputs[1][0]),
        ifFalse = this.generateCode(node.inputs[1][1]);

    return [
        `if (${cond}) {`,
        indent(ifTrue),
        `} else {`,
        indent(ifFalse),
        `}`
    ].join('\n');
};

backend.doRepeat = function(node) {
    var count = this.generateCode(node.inputs[0][0]),
        body = this.generateCode(node.inputs[1][0]),
        iterVar = node.id;

    return [
        `for (var ${iterVar} = +${count}; ${iterVar}--;) {`,
        indent(body),
        `}\n`
    ].join('\n');
};

///////////////////// Looks ///////////////////// 
backend.getScale = function(node) {
    return `__ENV.${node.type}.call(this)`;
};

backend.doSayFor = function(node) {
    var inputs = node.inputs[0].map(this.generateCode);
    inputs[1] = '+' + inputs[1];
    return `__ENV.doSayFor.call(this, ${inputs.join(', ')});`;
};

backend.bubble = function(node) {
    var inputs;

    inputs = this.generateCode(node.inputs[0][0]);
    return `__ENV.bubble.call(this, ${inputs});`;
};

///////////////////// Operators ///////////////////// 
backend.reportEquals = function(node) {
    console.log('<<<< ', node);
    var left = this.generateCode(node.inputs[0][0]),
        right = this.generateCode(node.inputs[1][0]);

    return `+${left} === +${right}`;
};

backend.reportJoinWords = function(node) {
    var listInput = node.inputs[0][0],
        inputs = listInput.inputs[0].map(this.generateCode);

    return `[${inputs.join(',')}].join('')`;
};

///////////////////// Variables ///////////////////// 
backend.doChangeVar =
backend.doSetVar = function(node) {
    var name = this.generateCode(node.inputs[0][0]);
    var value = this.generateCode(node.inputs[0][1] || node.inputs[1][0]) || null;

    return `__ENV.${node.type}.call(this, ${name}, ${value});`;
};

backend.doShowVar =
backend.doHideVar = function(node) {
    var name = this.generateCode(node.inputs[0][0]);

    return `__ENV.${node.type}.call(this, ${name});`;
};

backend.doDeclareVariables = function(node) {
    var names = node.inputs[0][0].inputs[0]
        .map(input => this.generateCode(input));

    return `__ENV.${node.type}.call(this, ${names});`;
};

backend.doAddToList = function(node) {
    var value = this.generateCode(node.inputs[0][0]),
        rawList = node.inputs[1][0],
        list = null;

    if (rawList && rawList.type === 'variable') {
        list = `'${rawList.value}'`;
    }
    return `__ENV.${node.type}.call(this, ${value}, ${list});`;
};

backend.reportListLength = function(node) {
    var variable = null;

    if (node.inputs[0][0] && node.inputs[0][0].type === 'variable') {
        variable = node.inputs[0][0].value;
    }

    return `__ENV.${node.type}.call(this, '${variable}')`;
};

backend.reportListItem = function(node) {
    var index = this.generateCode(node.inputs[0][0]),
        list = this.generateCode(node.inputs[1][0]);

    return `__ENV.${node.type}.call(this, ${index}, ${list})`;
};

backend.reportCDR = function(node) {
    var list = this.generateCode(node.inputs[0][0]);
    return `__ENV.${node.type}.call(this, ${list})`;
};

backend.reportNewList = function(node) {
    console.log();
    console.log(node.inputs);
    var items = [];
    // TODO: multiple item support
    return `__ENV.${node.type}.call(this)`;
};

backend.reportListContainsItem = function(node) {
    var list = this.generateCode(node.inputs[0][0]);
    var item = this.generateCode(node.inputs[1][0]);
    return `__ENV.${node.type}.call(this, ${list}, ${item})`;
};

backend.doDeleteFromList = function(node) {
    var list = this.generateCode(node.inputs[1][0]);
    var index = this.generateCode(node.inputs[0][0]);
    return `__ENV.${node.type}.call(this, ${index}, ${list});`;
};

backend.doReplaceInList = function(node) {
    var index = this.generateCode(node.inputs[0][0]);
    var item = this.generateCode(node.inputs[0][1]);
    var list = this.generateCode(node.inputs[1][0]);
    return `__ENV.${node.type}.call(this, ${index}, ${list}, ${item});`;
};

backend.doInsertInList = function(node) {
    var value = this.generateCode(node.inputs[0][0]);
    var index = this.generateCode(node.inputs[0][1]);
    var rawList = node.inputs[1][0];
    var listName = null;

    if (rawList && rawList.type === 'variable') {
        listName = `'${rawList.value}'`;
    }

    return `__ENV.${node.type}.call(this, ${value}, ${index}, ${listName});`;
};

backend.variable = function(node) {
    return `__ENV.${node.type}.call(this, '${node.value}')`;
};

///////////////////// Primitives ///////////////////// 
backend.string = function(node) {
    return `'${node.value}'`;
};

backend.option = function(node) {
    return this.generateCode(node.inputs[0][0]);
};

backend.bool = function(node) {
    var content = node.inputs[0][0],
        value = 'false';

    if (content && content.value === 'true') {
        value = content.value;
    }

    return value;
};

module.exports = backend;