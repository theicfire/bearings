var assert = require("assert");
var _ = require("underscore");
var Tree = require('../lib/Tree');
var Convert = require('../lib/Convert');
var multiline = require('multiline');


var sampleHtml = multiline(function(){/*
<meta http-equiv="content-type" content="text/html; charset=utf-8"><ul style="margin: 15px 0px 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; list-style: disc; color: rgb(51, 51, 51); font-family: 'Helvetica Neue', Arial, sans-serif; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 17px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 1; word-spacing: 0px; -webkit-text-stroke-width: 0px; background: transparent;"><li style="margin: 4px 0px 4px 20px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; background: transparent;"><span class="name" data-wfid="fce98f07a496" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; white-space: pre-wrap; background: transparent;">one</span><ul style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; list-style: disc; background: transparent;"><li style="margin: 4px 0px 4px 20px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; background: transparent;"><span class="name" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; white-space: pre-wrap; background: transparent;">two</span></li><li style="margin: 4px 0px 4px 20px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; background: transparent;"><span class="name" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; white-space: pre-wrap; background: transparent;">three</span><ul style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; list-style: disc; background: transparent;"><li style="margin: 4px 0px 4px 20px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; background: transparent;"><span class="name" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; white-space: pre-wrap; background: transparent;">four</span><ul style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; list-style: disc; background: transparent;"><li style="margin: 4px 0px 4px 20px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; background: transparent;"><span class="name" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; white-space: pre-wrap; background: transparent;">five</span></li></ul></li></ul></li></ul></li></ul>
*/});

var sample2 = multiline(function(){/*
<meta charset='utf-8'><ul style="margin: 15px 0px 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; list-style: disc; color: rgb(51, 51, 51); font-family: 'Helvetica Neue', Arial, sans-serif; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: 17px; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 1; word-spacing: 0px; -webkit-text-stroke-width: 0px; background: transparent;"><li style="margin: 4px 0px 4px 20px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; background: transparent;"><span class="name" data-wfid="1b4724fe60a5" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; white-space: pre-wrap; background: transparent;">one</span><ul style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; list-style: disc; background: transparent;"><li style="margin: 4px 0px 4px 20px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; background: transparent;"><span class="name" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; white-space: pre-wrap; background: transparent;">two</span><ul style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; list-style: disc; background: transparent;"><li style="margin: 4px 0px 4px 20px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; background: transparent;"><span class="name" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; white-space: pre-wrap; background: transparent;">three</span></li></ul></li></ul></li><li style="margin: 4px 0px 4px 20px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; background: transparent;"><span class="name" data-wfid="bcf94f466811" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; font-size: 13px; vertical-align: baseline; white-space: pre-wrap; background: transparent;">four</span></li></ul>
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

it('another test', function(){
    var res = Convert.htmlToTree(sample2);
    var expect = Tree.makeTree([{title: 'one', childNodes: [
            {title: 'two', childNodes: [
                    {title: 'three'}]}]},
            {title: 'four'}]);
    res = Tree.makeTree(res);
    assert(Tree.equals(res, expect));
});
