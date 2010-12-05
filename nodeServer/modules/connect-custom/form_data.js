function decode(token) {
	return decodeURIComponent(token.replace(/\+/g, " "));
}

function parseToken(token) {
	return token.split("=").map(decode);
}

function internalSetValue(target, key, value, force) {
	var arrayTest = key.match(/(.+?)\[(.*)\]/);
	if (arrayTest) {
		target = (target[arrayTest[1]] = target[arrayTest[1]] || []);
		target = target[arrayTest[2]] = value;
	} else {
		target = (target[key] = force ? value : target[key] || value);
	}
	return target;
}

function setValue(target, key, value) {
	var subkeys = key.split(".");
	var valueKey = subkeys.pop();

	for (var ii = 0; ii < subkeys.length; ii++) {
		target = internalSetValue(target, subkeys[ii], {}, false);
	}

	internalSetValue(target, valueKey, value, true);
}

module.exports = function(data) {
	var result = {};

	if (data && data.split) {
		data.split("&").map(parseToken).forEach(function(token) {
			setValue(result, token[0], token[1]);
		});
	}

	return result;
}