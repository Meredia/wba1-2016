/* Data
################################################################## */

var model = {};
model.data = {};

model.data.quizQuestionsData = {};
model.data.quizQuestionsData.answers = {};





/* Functions
################################################################## */


/* Aufruf Ajax-Request */
function get(url, callback) {
  
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4) { callback.call(this); }
	};

	xhttp.open("GET", url, true);
	xhttp.send();

}





function createQuizOverview(){
	
	// JSON holen und danach Temlate ziehen
	var quizOverviewData;
	get(dataUrls.quizOverview, requireTemplate);
	
	// Lies das Wrap Templates aus und gib mir den Inhalt
	function requireTemplate(){
		model.data.quizOverviewData = JSON.parse(this.responseText);
		get(templateUrls.quizOverview, renderTemplate);
	}
	
	function renderTemplate() { 
		var template = this.responseText;
		
		// Inhalt in Quiz-warp injizieren	
		var target = document.getElementById("content");
		target.innerHTML = template;
		
		// Item Template ziehen und speichern
		var quizItem = document.getElementsByClassName("quiz-item")[0];

		// Item im Wrap löschen
		quizItem.parentNode.removeChild(quizItem);
	
		// Durch das QuizOverview JSON iterieren
		var resultHtml = "";
		for(var quiz in model.data.quizOverviewData){
			
			// Item Template zwischenspeichern
			resultHtml = quizItem.outerHTML;

			// Platzhalter ersetzen
			resultHtml = resultHtml.replace(/{{quizId}}/, quiz);
			resultHtml = resultHtml.replace(/{{quizName}}/, model.data.quizOverviewData[quiz].name);
			resultHtml = resultHtml.replace(/{{quizDescription}}/, model.data.quizOverviewData[quiz].description);
			
			// Element erzeugen und mit Event ausstatten
			var item = document.createElement("div");
			item.innerHTML = resultHtml;
			item.firstChild.onclick = function(){ showQuizStart(this); };
			 
			// HTML in Wrap einfügen
			document.getElementById("quizzes").appendChild(item.firstChild);
			
		}

	}
	
}





function showQuizStart( quiz ){
	
	var data = model.data.quizOverviewData[quiz.id];
	
	// Template Quiz-Start holen
	get(templateUrls.quizStart, renderTemplate);

	// Quiz-Start mit Inhalt fuellen
	function renderTemplate() { 
		var template = this.responseText;

		// Plazthalter ersetzen	
		template = template.replace(/{{quizName}}/, data.name );
		template = template.replace(/{{quizDescription}}/, data.description );

		// Inhalt in Quiz-warp injizieren	
		var target = document.getElementById("content");
		target.innerHTML = template;
		
		// Buttons mit Event ausstatten
		var play = document.getElementById("spielen");
		play.onclick = function() {initQuiz(quiz.id); };	

		var back = document.getElementById("zurueck");
		back.onclick = function() {createQuizOverview(); };	
		
	}
	
}




function initQuiz( quizId ){
	setDataUrlsQuiz(quizId);

	// JSON holen und Quiz initialisieren
	var quizQuestionsData;
	get(dataUrls.quizQuestions, init);
	
	// Wir müssen ja die Zeit messen, darum brauchen wir ein Datum
	var date = new Date();
	
	function init(){
		model.data.quizQuestionsData.activeQuiz          = JSON.parse(this.responseText);
		model.data.quizQuestionsData.activeQuestionCount = 1;
		model.data.quizQuestionsData.activeQuizId        = quizId;
		model.data.quizQuestionsData.activeQuestion      = model.data.quizQuestionsData.activeQuiz["question1"];
		model.data.quizQuestionsData.startTime           = date.getTime();
		model.data.quizQuestionsData.duration            = 0;
		model.data.quizQuestionsData.rightAnswers        = 0;
		model.data.quizQuestionsData.timeout             = false;
		
		// Wie viele Fragen hat das Quiz?
		var i = 1;
		var id = "question" + i;
		while(typeof model.data.quizQuestionsData.activeQuiz[id] === 'object'){
			i++; id = "question" + i;
		}
		model.data.quizQuestionsData.maxQuestions = i - 1;
		
		// Quiz starten
		playQuiz();
	}
	
}




function playQuiz( ){

	// Template Quiz-Questions holen
	get(templateUrls.quizQuestions, renderTemplate);

	// Quiz-Questions mit Inhalt fuellen
	function renderTemplate() { 

		var template = this.responseText;
		var activeQuestion = model.data.quizQuestionsData.activeQuestion;
	
		// Plazthalter ersetzen
		template = template.replace(/{{quizFrage}}/, activeQuestion.question );
		template = template.replace(/{{optionA}}/, activeQuestion.options.optionA );
		template = template.replace(/{{optionB}}/, activeQuestion.options.optionB );
		template = template.replace(/{{optionC}}/, activeQuestion.options.optionC );
		template = template.replace(/{{optionD}}/, activeQuestion.options.optionD );

		// Inhalt in Quiz-warp injizieren	
		var target = document.getElementById("content");
		target.innerHTML = template;
		
		// Buttons mit Events ausstatten
		var optionA = document.getElementById("option-A");
		optionA.onclick = function() { checkAnswer("A"); };
		
		var optionB = document.getElementById("option-B");
		optionB.onclick = function() { checkAnswer("B"); };	

		var optionC = document.getElementById("option-C");
		optionC.onclick = function() { checkAnswer("C"); };
		
		var optionD = document.getElementById("option-D");
		optionD.onclick = function() { checkAnswer("D"); };
		
		// Wir haben nur begrenzte Zeit
		model.data.quizQuestionsData.timeout = setTimeout(function(){ checkAnswer("falsch"); }, base.quizTimeout * 1000);
		
		// Progressbar aktivieren
		setTimeout(function(){ document.getElementById("progress-bar").className += " countdown"; }, 100 );



	}

}




function checkAnswer( answer ){
	
	// Wir müssen den Timeout löschen	
	clearTimeout(model.data.quizQuestionsData.timeout);
	
	var data = model.data.quizQuestionsData;
	var questionId = "question" + data.activeQuestionCount;
			
	// Ist die Antwort richtig?
	if(answer == data.activeQuestion.answer){
		data.rightAnswers++;
		data.answers[questionId] = true;
	}else{
		data.answers[questionId] = false;
	}
	
	// Naechste Frage
	data.activeQuestionCount++;
	questionId = "question" + data.activeQuestionCount;
	data.activeQuestion = data.activeQuiz[questionId];
	
	// Wie lange hat es gedauert?
	var date = new Date();
	var jetzt = date.getTime();
	var dauer = jetzt - data.startTime;
	data.duration = dauer;
		
	// Gibt es noch Fragen?
	if(data.activeQuestionCount <= data.maxQuestions){
		
		playQuiz();	
	}else{
		finishQuiz();
	}
	
}





function finishQuiz(){
	
	var data           = model.data.quizOverviewData[model.data.quizQuestionsData.activeQuizId];
	var dataActiveQuiz = model.data.quizQuestionsData;
	
	// Template Quiz-Start holen
	get(templateUrls.quizEnd, renderTemplate);

	// Quiz-Start mit Inhalt fuellen
	function renderTemplate() { 
		var template = this.responseText;
		
		// Die Dauer rechnen wir schön
		var dauerSchoen = moment.utc(dataActiveQuiz.duration).format("mm:ss");
		
		// Plazthalter ersetzen	
		template = template.replace(/{{quizName}}/, data.name );
		template = template.replace(/{{quizDescription}}/, data.description );
		template = template.replace(/{{dauer}}/, dauerSchoen );
		template = template.replace(/{{anzahlFragen}}/, dataActiveQuiz.maxQuestions );
		template = template.replace(/{{richtigBeantwortet}}/, dataActiveQuiz.rightAnswers );

		// Inhalt in Quiz-warp injizieren	
		var target = document.getElementById("content");
		target.innerHTML = template;
		
		// Buttons mit Event ausstatten
		var play = document.getElementById("spielen");
		play.onclick = function() { initQuiz(model.data.quizQuestionsData.activeQuizId); };	

		var back = document.getElementById("zurueck");
		back.onclick = function() { location.href = "quiz-wrap.htm"; };	
		
	}
	
}



/*
getTemplate(templateUrls.quizOverview).then(function(response) {
	var target = document.getElementById("content");
	target.innerHTML = response;
	
	// Item Template ziehen und speichern
	var item = document.getElementById("quiz-item");
	
	// Item im Wrap löschen
	item.parentNode.removeChild(item);
	console.log(item);
	

// The second runs when the promise
// is rejected, and logs the Error specified with the reject() method.
	}, function(Error) {
	console.log(Error);
	}); */
	
