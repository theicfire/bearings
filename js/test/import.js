var assert = require("assert");
var cheerio = require('cheerio');
var _ = require("underscore");
var Tree = require('../lib/Tree');
var multiline = require('multiline');
var Convert = {};


var sampleHtml = multiline(function(){/*
<meta http-equiv="content-type" content="text/html; charset=utf-8"><ul style="margin: 15px 0px 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; list-style: disc; color: rgb(51, 51, 51); font-family: 'Helvetica Neue', Arial, sans-serif; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 17px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 1; word-spacing: 0px; -webkit-text-stroke-width: 0px; background: transparent;"><li style="margin: 4px 0px 4px 20px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; background: transparent;"><span class="name" data-wfid="fce98f07a496" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; white-space: pre-wrap; background: transparent;">one</span><ul style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; list-style: disc; background: transparent;"><li style="margin: 4px 0px 4px 20px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; background: transparent;"><span class="name" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; white-space: pre-wrap; background: transparent;">two</span></li><li style="margin: 4px 0px 4px 20px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; background: transparent;"><span class="name" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; white-space: pre-wrap; background: transparent;">three</span><ul style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; list-style: disc; background: transparent;"><li style="margin: 4px 0px 4px 20px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; background: transparent;"><span class="name" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; white-space: pre-wrap; background: transparent;">four</span><ul style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; list-style: disc; background: transparent;"><li style="margin: 4px 0px 4px 20px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; background: transparent;"><span class="name" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; white-space: pre-wrap; background: transparent;">five</span></li></ul></li></ul></li></ul></li></ul>
*/});

it('html string conversion love', function(){
    var res = Convert.htmlToTree(sampleHtml);
    var expect = Tree.makeTree([{title: 'one', childNodes: [
            {title: 'two'},
            {title: 'three', childNodes: [
                    {title: 'four', childNodes: [
                            {title: 'five'}]}]}]}]);
    res = Tree.makeTree(res);
    assert(Tree.equals(res, expect));
});

Convert.htmlToTree = function(html) {
    $ = cheerio.load(html);
    var t = Convert.domToTree($('ul').eq(0));
    console.log('t', JSON.stringify(t, null, ' '));
    var sl = Convert.slim(t);
    console.log('slim', JSON.stringify(sl, null, ' '));
    return sl;
}

Convert.domToTree = function(objs) {
    var ret = [];
    objs.each(function(i, el) {
        //console.log('name', el.name, 'type', el.type);
        if (el.name === 'span') {
            ret.push($(this).text());
        } else {
            //console.log('el', $(this));
            ret.push(Convert.domToTree($(this).children()));
        }
    });
    return ret;
}

// If first element is an array, return a list of children
// If the first element is a string, return a {title, childNodes} object

Convert.slim = function(t) {
    if (typeof(t[0]) === 'string') {
        console.assert(t.length <= 2);
        if (t.length === 2) {
            return {title: t[0], childNodes: Convert.slim(t[1])};
        }
        return {title: t[0]};
    }
    if (t.length === 1 && typeof(t[0][0]) !== 'string' && t[0].length === 1) {
        return Convert.slim(t[0]);
    }
    var ret = [];
    for (var i = 0; i < t.length; i++) {
        ret.push(Convert.slim(t[i]));
    }
    return ret;
}
