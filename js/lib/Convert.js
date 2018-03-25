var cheerio = require('cheerio');

var Convert = {};
module.exports = exports = Convert;

Convert.htmlToTree = function(html) {
	let $ = cheerio.load(html);
	var t = Convert.domToTree($, $('ul').eq(0));
	//console.log('t', JSON.stringify(t, null, ' '));
	var sl = Convert.slim(t);
	sl[0].selected = true; // TODO what if there is not sl[0]? Give user error?
	//console.log('slim', JSON.stringify(sl, null, ' '));
	return sl;
};

Convert.domToTree = function($, objs) {
	var ret = [];
	objs.each(function(i, el) {
		//console.log('name', el.name, 'type', el.type);
		if (el.name === 'span') {
			ret.push($(this).text());
		} else {
			//console.log('el', $(this));
			ret.push(Convert.domToTree($, $(this).children()));
		}
	});
	return ret;
};

// If first element is an array, return a list of children
// If the first element is a string, return a {title, childNodes} object
Convert.slim = function(t) {
	if (typeof t[0] === 'string') {
		console.assert(t.length <= 3);
		if (t.length >= 2) {
			if (t.length === 3) {
				console.log(
					'There is extra (ctrl+enter) text with the bullet point named',
					t[0]
				);
			}
			return { title: t[0], childNodes: Convert.slim(t[1]) };
		}
		return { title: t[0] };
	}
	if (t.length === 1 && typeof t[0][0] !== 'string') {
		return Convert.slim(t[0]);
	}
	var ret = [];
	for (var i = 0; i < t.length; i++) {
		ret.push(Convert.slim(t[i]));
	}
	return ret;
};
