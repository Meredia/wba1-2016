

var Template = function() {

};


Template.prototype.render = function(template, data) {

	/*
		Funktion, die für ein Objekt rekursiv aufgereufen wird

		Ein Objekt der Form:

		{
			'one': {
				'one': 11
				'two': 12
			},
			'two': {
				'one': 21,
				'two': 22
			}
		}

		wird überführt in:

		{
			'one.one': 11,
			'one.two': 12,
			'two.one': 21,
			'two.two': 22
		}


	 */
	function flattenObject(mainObj, obj, prefix) {
		for(var k in obj) {
			var newPrefix = prefix;
			if(newPrefix.length > 0)
				newPrefix += '.';

			newPrefix += k;

			if( typeof(obj[k]) === 'object' ) {
				flattenObject(mainObj, obj[k], newPrefix );
			}
			else {
				mainObj[newPrefix] = obj[k];
			}
		}
	}

	var flattenData = {};
	flattenObject(flattenData, data, '');


	for(var key in flattenData) {
		var regexp = new RegExp("{{\\s*" + key + "\\s*}}");
		template = template.replace(regexp, flattenData[key]);
	}

	return template;
};