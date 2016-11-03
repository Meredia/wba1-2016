"use strict";


var Quiz = function( callback, options ) {

	var self = this;

	this.options       = {
		'quizOverviewFilename': 'quizOverview.json',
		'quizBaseDir'         : 'assets/data'
	};
	this.quizSet       = {};
	this.currentQuizId = '';

	/*.Leeres Objekt setzen, sofern keine Optionen von außen gegeben wurden */
	options = options || {};

	/* Optionen setzen bzw. durch von außen gegebene Optionen überschreiben */
	for(var opt in options) {
		this.options[opt] = options[opt];
	}


	/* Dokument der Quizübersicht holen */
	var url = this.options['quizBaseDir'] + '/' + this.options['quizOverviewFilename'];

	Helper.get(url, function(xhr) {
		self.quizSet = JSON.parse(xhr.responseText);

		if(typeof(callback) === 'function')
		 callback();
	});
}


Quiz.prototype.loadQuiz = function(id, callback) {

	var self = this;
	var externalQuizJSONs = {
		'questions': 'questions.json',
		'highscore': 'highscore.json'
	};

	this.getCurrentQuiz().loaded = true;

	var waterfall = Helper.waterfall();

	var keys = Object.keys(externalQuizJSONs);

	for(var k in externalQuizJSONs) {

		(function(k) {

			waterfall.then(function(value, next) {
				var url = self.options['quizBaseDir'] + '/' + id + '/' + externalQuizJSONs[k];

				Helper.get(url, function(xhr) {
					value[k] = JSON.parse(xhr.responseText);
					next(value);
				});
			});
		})(k);
	}

	waterfall.done(function(value) {
		for(var k in value) {
			self.getCurrentQuiz()[k] = value[k];
		}

		if(typeof(callback) === 'function')
			callback(self.getCurrentQuiz());
	})
};


Quiz.prototype.getQuiz = function(id, callback) {

	var currentQuiz = this.getCurrentQuiz();

	if(!currentQuiz.loaded) {
		this.loadQuiz(id, callback);
	}
	else {
		callback(this.getCurrentQuiz());
	}
};


Quiz.prototype.setCurrentQuiz = function(id, callback) {

	if( this.quizSet[id] ) {
		this.currentQuizId = id;
		return this.getQuiz(id, callback);
	}
	else {
		return false;
	}
};


Quiz.prototype.getCurrentQuiz = function() {
	return this.quizSet[this.currentQuizId];
};


Quiz.prototype.checkAnswerForCurrentQuizz = function(answer, questionID) {
	return this.getCurrentQuiz().questions[questionID].answer === answer;
};