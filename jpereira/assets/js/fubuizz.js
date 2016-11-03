

var Fubuizz = function(containerSelector, options) {

	if(typeof(containerSelector) !== 'string')
		throw new Error('Kein gültiger Element-Selektor gegeben!');

	this.userData = {
		points          : 0,
		overallDuration : 0,
		timestamp       : null,
		questionsStatus : []
	};

	this.currentQuestionsKeys = [];
	this.currentQuestionsSet  = {};

	this.quizData = new Quiz();
	this.template = new Template();

	this.container = document.querySelector(containerSelector);

	this.options = {
		'questionTimeout': 5,
		'templateDir'    : 'assets/templates',
		'templates'      : {
			'quiz-end'      : 'quiz-end.htm',
			'quiz-overview' : 'quiz-overview.htm',
			'quiz-questions': 'quiz-questions.htm',
			'quiz-start'    : 'quiz-start.htm'
		}
	};

	if(typeof(options) !== 'object')
		options = {};

	options.templates = options.templates || {};

	/* Von außen gegebene TemplatePfade übernhemen, sofern gegeben */
	this.options.templateDir = options.templateDir || this.options.templateDir;

	for(var k in options.templates) {
		this.options.templates[k] = options.templates[k];
	}
};

Fubuizz.prototype.start = function() {

	var self = this;

	/* Overview erzeugen */
	var url = this.options.templateDir + '/' + this.options.templates['quiz-overview'];

	Helper.get(url, function(xhr) {
		var htmlTemplate = xhr.responseText;

		self.container.innerHTML = htmlTemplate;

		var quizItem    = self.container.querySelector('.quiz-item');
		var quizItemRaw = quizItem.outerHTML;

		quizItem.parentNode.removeChild(quizItem);

		var itemCollectorHTML = '';

		for(var item in self.quizData.quizSet) {

			self.quizData.quizSet[item].quizId = item;
			var renderedTemplate = self.template.render(quizItemRaw, self.quizData.quizSet[item]);

			itemCollectorHTML += renderedTemplate;
		}

		self.container.querySelector('#quizzes').innerHTML = itemCollectorHTML;

		self.container.querySelectorAll('.quiz-item').forEach(function(node) {
			node.addEventListener('click', function() {
				var quizId = this.id;
				self.showQuiz(quizId);
			});
		});
	});

};



Fubuizz.prototype.showQuiz = function(id) {

	var self = this;

	this.quizData.setCurrentQuiz(id, function(quiz) {
		if(!quiz.loaded) {
			console.log('Quiz mit der ID ' + id + ' konnte nicht geladen werden!');
			return;
		}

		var url = self.options.templateDir + '/' + self.options.templates['quiz-start'];
		Helper.get(url, function(xhr) {
			var htmlTemplate = xhr.responseText;

			var renderedTemplate = self.template.render( htmlTemplate, self.quizData.getCurrentQuiz() );

			self.container.innerHTML = renderedTemplate;

			var spielen_btn = self.container.querySelector('#spielen');
			spielen_btn.addEventListener('click', function() {
				/* Quiz spielen */
				self.startQuiz(id);
			});

			var zurueck_btn = self.container.querySelector('#zurueck');
			zurueck_btn.addEventListener('click', function() {
				/* Zurück zur Übersichtsseite */
				self.start();
			});
		});
	});
};



Fubuizz.prototype.startQuiz = function() {
	var self = this;

	this.currentQuestionsKeys = Object.keys(self.quizData.getCurrentQuiz().questions).sort();

	this.nextQuestion();
};



Fubuizz.prototype.nextQuestion = function() {

	var self = this;

	window.clearTimeout(self.timeout);

	this.currentQuestionKey = this.currentQuestionsKeys.shift();

	var currentQuestionSet = self.quizData.getCurrentQuiz().questions[this.currentQuestionKey];

	var url = self.options.templateDir + '/' + self.options.templates['quiz-questions'];

	Helper.get(url, function(xhr) {
		var htmlTemplate = xhr.responseText;
		var renderedTemplate = self.template.render(htmlTemplate, currentQuestionSet);

		self.container.innerHTML = renderedTemplate;

		self.userData.timestamp = new Date().getTime();

		self.container.querySelectorAll('.answer button').forEach(function(node) {
			node.addEventListener('click', function() {
				self.checkAnswer(this.id, self.currentQuestionKey);

				if( self.currentQuestionsKeys.length === 0 ) {
					self.endQuiz();
				}
				else {
					self.nextQuestion();
				}
			});
		});

		/* Timer setzen */
		var progressBar = self.container.querySelector("#progress-bar");
		progressBar.style.transition = 'all ' + self.options.questionTimeout + 's linear';


		setTimeout(function() { progressBar.className += " countdown"}, 100);

		self.timeout = window.setTimeout(function() {
			self.checkAnswer('', self.currentQuestionKey);

			if( self.currentQuestionsKeys.length === 0 ) {
				self.endQuiz();
			}
			else {
				self.nextQuestion();
			}

		}, self.options.questionTimeout * 1000);
	});
};



Fubuizz.prototype.checkAnswer = function(answer, questionID) {

	var answer = answer.replace('option-', '');

	var isCorrect = this.quizData.checkAnswerForCurrentQuizz(answer, questionID);

	var questionStatus = {
		questionID : questionID,
		correct    : isCorrect,
		duration   : (new Date()).getTime() - this.userData.timestamp
	};

	if(isCorrect) {
		this.userData.points += 1;
	}

	this.userData.overallDuration += questionStatus.duration;

	this.userData.questionsStatus.push(questionStatus);
}



Fubuizz.prototype.endQuiz = function() {
	var self = this;

	window.clearTimeout(self.timeout);

	/* Punkte und Dauer ausgeben */

	var url = self.options.templateDir + '/' + self.options.templates['quiz-end'];

	var duration = {
		min: Math.floor((this.userData.overallDuration / 1000) / 60),
		sec: parseInt((this.userData.overallDuration / 1000) % 60)
	};



	var timeStr = Helper.leftPad(duration.min, 2, '0') + ':' + Helper.leftPad(duration.sec, 2, '0');

	var result = {
		name               : this.quizData.getCurrentQuiz().name,
		description        : this.quizData.getCurrentQuiz().description,

		dauer              : timeStr,

		anzahlFragen	   : this.userData.questionsStatus.length,
		richtigBeantwortet : this.userData.questionsStatus.filter(function(val) { return val.correct; }).length
	};

	Helper.get(url, function(xhr) {
		var htmlTemplate     = xhr.responseText,
			renderedTemplate = self.template.render(htmlTemplate, result);

		self.container.innerHTML = renderedTemplate;

		var nochmal_spielen_btn = self.container.querySelector('#spielen'),
			zurueck_btn         = self.container.querySelector('#zurueck');

		nochmal_spielen_btn.addEventListener('click', self.startQuiz.bind(self));
		zurueck_btn.addEventListener('click', self.start.bind(self));

		/* User-Daten zurücksetzen */
		self.userData = {
			points          : 0,
			overallDuration : 0,
			timestamp       : null,
			questionsStatus : []
		};
	});

}