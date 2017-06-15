(function() {
	var questions =[{
		question: "Who did the Mona Lisa paint?",
		choices: ["Picasso", "Michelangelo", "Leonardo Da Vinci", "Van Gogh"],
		correctAnswer: 2
	// }, {	
	// 	question: "What is the world's longest river?",
	// 	choices: ["Mekong", "Yangtze", "Amazon", "Nile"],
	// 	correctAnswer: 2
	// }, {	
	// 	question: "What is the biggest country?",
	// 	choices: ["Canada", "China", "USA", "Russia"],
	// 	correctAnswer: 3
	// }, {	
	// 	question: "What is the capital city of Spain?",
	// 	choices: ["Madrid", "Barcelona", "Valencia", "Sevilla"],
	// 	correctAnswer: 0
	// }, {	
	// 	question: "Who played Neo in The Matrix?",
	// 	choices: ["Keanu Reeves", "Tom Cruise", "Brad Pitt", "Matt Demon"],
	// 	correctAnswer: 0
	// }, {
	// 	question: "Who is Marvel hero character?",
	// 	choices: ["Wonder Women", "Batman", "Aquaman", "Ironman"],
	// 	correctAnswer: 3
	}];

var questionCounter = 0; //Tracks the question.
var selections = []; //Contain user choices.
var quiz = $('#quiz');
	
//Creates and returns the div that contains the question and the answer selections.
function createField(index) {
	var qElement = $('<div>', {
		id: 'question'
	});

	var header = $('<h2>Question ' + (index + 1) + ':</h2>');
	qElement.append(header);

	var body = $('<p>', {id: 'question'}).append(questions[index].question);
	qElement.append(body);

	var radiosButtons = createRadios(index);
	qElement.append(radiosButtons);

	return qElement;
}
// Create a list of answer choices as radion inputs.
function createRadios(index) {
	var radioList = $('<ul>');
	var item;
	var input = '';
	for (var i = 0; i < questions[index].choices.length; i ++) {
		item = $('<li>');
		input = '<input type="radio" class="option-input radio" name="answer" value=' + i + ' />';
		input += questions[index].choices[i];
		item.append(input);
		radioList.append(item);
	}
	return radioList;
}

// Reads the user each selection and pushes the value to an array created.
function choose() {
	selections[questionCounter] = +$('input[name="answer"]:checked').val();
}

//Displays next
function displayNext() 
	{
		quiz.fadeOut(function() 
		{
			$('#question').remove();

			if (questionCounter < questions.length) {
				var nextQuestion = createField(questionCounter);
				quiz.append(nextQuestion).fadeIn();
				if (!(isNaN(selections[questionCounter]))) {
					$('input[value=' + selections[questionCounter] + ']').prop('checked', true);	
				}

				//Controls display of 'prev' button
				if(questionCounter === 1) {
					$('#prev').show();
				} else if (questionCounter === 0) {
					$('#prev').hide();
					$('#next').show();
				}
			} else {
				var scoreElement = displayScore(); //Creates below
				quiz.append(scoreElement).fadeIn();
				$('#next').hide();
				$('#prev').hide();
				$('#start').show();
			}
		});
	}

//Computes score and returns a paragraph element to be displayed
function displayScore() 
	{
		var score = $('<p>', {id: 'question'});
		var numCorrect = 0;
		for (var i = 0; i < selections.length; i ++) {
			if (selections[i] === questions[i].correctAnswer) {
				numCorrect ++;
			}
		}
		if (numCorrect < questions.length) 
		{
			score.append('You got ' + numCorrect + ' questions out of ' + questions.length + ' right!');
			return score;
		} else {
			score.append('<a href="congrats.html">You\'ve completed the Quiz with 100% correct answers!!! Click here</a>');
			return score;
		}
	}

//Display initial question
displayNext();

//Click handler for the 'start' button
$('#start').on('click', function(e) {
	e.preventDefault();

	//Suspend click listener during the fade animation <-- Check this again!
	if (quiz.is(':animated')) {
		return false;
	}
	questionCounter = 0;
	selections = [];
	displayNext();
	$('#start').hide();
});

//Click handler for the 'next' button
$('#next').on('click', function (e) {
	e.preventDefault();

	//Suspend click listener during the fade animation <-- Check this again!
	if (quiz.is(':animated')) {
		return false;
	}
	choose();

	//If no user selection, alert!
	if (isNaN(selections[questionCounter])) {
		alert('Please choose an answer!');
	} else {
		questionCounter ++;
		displayNext();
	}
});

//Click handler for the 'prev' button
$('#prev').on('click', function (e) {
	e.preventDefault();

	//Suspend click listener during the fade animation <-- Check this again!
	if (quiz.is(':animated')) {
		return false;
	}
	choose();
	questionCounter --;
	displayNext();
});

// Animates buttons on hover
  $('.button').on('mouseenter', function () {
    $(this).addClass('active');
  });
  $('.button').on('mouseleave', function () {
    $(this).removeClass('active');
  });

})();












