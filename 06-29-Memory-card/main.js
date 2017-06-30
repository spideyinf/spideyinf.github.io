var cardFront = [];
	//Create card front
	for (var i = 1; i < 10; i ++) {
		cardFront.push('images/f' + [i] +'.png');
	};

var background = ['background1.jpg', 'background2.jpeg', 'background3.jpeg', 'background4.jpg'];

var cardBack = 'images/back.jpg'
var current = null;

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

//Prepare the field
$(function() {
	cardFront = cardFront.concat(cardFront);
	cardFront = shuffle(cardFront);

	for (var i = 0; i < cardFront.length; i ++) {
		var cardHS = '<div class="col-xs-2"><div class="card-hs" data-name="' + cardFront[i] + '" onclick="flip(this)"><div class="front"><img class="img-responsive" src=' + cardFront[i] + '></div><div class="back"><img class="img-responsive" src=' + cardBack + '></div></div></div>';
		$('.row').append(cardHS);
	};

	// var rows = $('.container-fluid > .col-xs-2');
	// for (var i = 0; i < rows.length; i += 6) {	
	// 	rows.slice(i, i+6).wrapAll('<div class="row row-card"></div>');
	// }
})

function flip(card) {
	$(card).toggleClass('flipped');
	$(card).css('pointer-events', 'none');
	if (!current) {
		current = $(card);
	} else {
		$('.card-hs').css('pointer-events', 'none');
		if (current.attr('data-name') != $(card).attr('data-name')) {
			//Wrong cards

			setTimeout(function() {
				document.getElementById('wrong').play();
				current.toggleClass('flipped');
				$(card).toggleClass('flipped');
				current = null;
				$('.card-hs').css('pointer-events', 'auto');
			}, 500);

		//Correct
		} else {
			setTimeout(function() {
			document.getElementById('correct').play();
			$(card).css('opacity', '0');
			current.css('opacity', '0');		
			current = null;	
			$('.card-hs').css('pointer-events', 'auto');	
			}, 400);

		}
	}
}

$(function() {

});

