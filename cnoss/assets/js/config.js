var base = {};
base.templates = "assets/templates";
base.dataFolder = "assets/data";
base.quizTimeout = 5; // Dauer in Sekunden pro Frage

var templateUrls = {};
templateUrls.quizOverview     = base.templates + "/quiz-overview.htm";
templateUrls.quizStart        = base.templates + "/quiz-start.htm";
templateUrls.quizEnd          = base.templates + "/quiz-end.htm";
templateUrls.quizQuestions    = base.templates + "/quiz-questions.htm";

var dataUrls = {};
dataUrls.quizOverview = base.dataFolder + "/quizOverview.json";


function setDataUrlsQuiz(quizID){
	return dataUrls.quizQuestions = base.dataFolder + "/" + quizID + "/questions.json";
	return dataUrls.quizHighscore = base.dataFolder + "/" + quizID + "/highscore.json";
}
