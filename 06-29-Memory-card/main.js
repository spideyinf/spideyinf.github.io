var mode = {
	'normal':{'pairs': 6, 'time': 40}, 
	'hard':{'pairs': 9, 'time': 38}
};

var background = ['background1.jpg', 'background2.jpeg', 'background3.jpeg', 'background4.jpg'];

var cardBack = 'images/back.jpg'
var current = null;
var count = 0;
var progressPercent = 100;
var soundSource = {
	soundBackground: 'sounds/Main_Title.ogg',
	soundFlip: 'sounds/draw_card_1.ogg',
	soundFlipWrong: 'sounds/wrong.ogg',
	soundFlipCorrect: 'sounds/correct.ogg',
	soundDefeated: 'sounds/defeat_jingle.ogg',
	soundVictory1: 'sounds/victory_screen_start.ogg',
	soundVictory2: 'sounds/victory_jingle.ogg'	
};

function soundEffect(source) {
	var sound = document.createElement("audio");
	sound.src = source;
	sound.addEventListener('ended', function() {
		this.classList.remove();
	}, false);
	return sound;
};

function shuffle(arr) {
	var currentIndex = arr.length;
	var tempVal;
	var randomIndex;

	//While there remain elements to shuffle...
	while (0 !== currentIndex) {

		//Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		//And swap it with the current element.
		tempVal = arr[currentIndex];
		arr[currentIndex] = arr[randomIndex];
		arr[randomIndex] = tempVal;
	}
	return arr;
}
//Prepare to battle - Background
$(function() {
	background = shuffle(background);
	$('body').css('background-image', 'url(images/' + background[0] + ')');
})

//Start game
$('#startGame').modal({
	show: true,
	backdrop: 'static',
	keyboard: false
});

$('.btn-mode').on('click', function(event) {
	event.preventDefault();
	var timeMode = mode[$(this).attr('value')].time;
	var cardMode = mode[$(this).attr('value')].pairs;

var cardFront = [];
	//Create card front
	for (var i = 1; i <= cardMode; i ++) {
		cardFront.push('images/f' + [i] +'.png');
	};

var amount = 100/timeMode;

	//Prepare the field
	var counterBack = setInterval(function() {
		progressPercent -= amount;
		if (progressPercent > 25) {
			$('.progress-bar').css({
				'transition': 'width 1s linear',
				'width': progressPercent + '%',
				'transition-duration': '1000ms'
			});
		} else if (progressPercent <=25) {
			$('.progress-bar').removeClass('progress-bar-warning');
			$('.progress-bar').addClass('progress-bar-danger')
			$('.progress-bar').css({
				'transition': 'width 1s linear',
				'width': progressPercent + '%',
				'transition-duration': '1000ms'
			});
		} else {
			clearInterval(counterBack);
		}	
	}, 1000);


	cardFront = cardFront.concat(cardFront);
	cardFront = shuffle(cardFront);

	for (var i = 0; i < cardFront.length; i ++) {
		var cardHS = '<div class="col-xs-2"><div class="card-hs" data-name="' + cardFront[i] + '" onclick="flip(this)"><div class="front"><img class="img-responsive" src=' + cardFront[i] + '></div><div class="back"><img class="img-responsive" src=' + cardBack + '></div></div></div>';
		$('.container .row').append(cardHS);
	};

	var run = setInterval(function() {
		timeMode --;
		console.log(timeMode);
		//Victory
		if (count == cardMode) {
			clearInterval(run);
			clearInterval(counterBack);
			$('.modal-victory').modal({show: true, backdrop: 'static', keyboard: false});
			document.getElementById('soundBackground').pause();
			soundEffect(soundSource.soundVictory1).play();
			soundEffect(soundSource.soundVictory2).play();
			$('.card-hs').css('pointer-events', 'none');
		}
		//Time out
		if (timeMode == -1) {
			//Game is over
			clearInterval(run);
			clearInterval(counterBack);
			$('.modal-defeated').modal({show: true, backdrop: 'static', keyboard: false});
			document.getElementById('soundBackground').pause();
			soundEffect(soundSource.soundDefeated).play();
		}
	}, 1000);
});


function flip(card) {
	$(card).toggleClass('flipped');
	soundEffect(soundSource.soundFlip).play();
	$(card).css('pointer-events', 'none');
	if (!current) {
		current = $(card);
	} else {
		$('.card-hs').css('pointer-events', 'none');
		if (current.attr('data-name') != $(card).attr('data-name')) {
			//Wrong cards

			setTimeout(function() {
				soundEffect(soundSource.soundFlipWrong).play();
				current.toggleClass('flipped');
				$(card).toggleClass('flipped');
				current = null;
				$('.card-hs').css('pointer-events', 'auto');
			}, 500);

		//Correct
		} else {
			setTimeout(function() {
			soundEffect(soundSource.soundFlipCorrect).play();
			$(card).css('opacity', '0');
			current.css('opacity', '0');		
			current = null;	
			count ++;
			$('.card-hs').css('pointer-events', 'auto');	
			}, 500);

		}
	}
	$('.card-hs.flipped').css('pointer-events', 'none');
}

function replay() {
	window.location.reload();
}

function remove() {
	$('.container').remove();
	$('.reward-container').remove();
}

function showReward() {
	$('.reward').css('display', 'block');
}



