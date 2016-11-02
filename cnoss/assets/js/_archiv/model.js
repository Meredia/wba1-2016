var model = {};
model.data = {};

model.data.quizQuestionsData = {};
model.data.quizQuestionsData.answers = {};


/* Aufruf Ajax-Request */
function get(url, callback) {
  
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4) { callback.call(this); }
	};

	xhttp.open("GET", url, true);
	xhttp.send();

}

/* Für später
	
	### */
model.func = (function(){

	var exports = {};

	exports.getQuizOverviewData = function(){

	}
	
	return exports;
})();
