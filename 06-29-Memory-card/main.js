var cardFront = [];
	//Create card front
	for (var i = 1; i < 6; i ++) {
		cardFront.push('images/f' + [i] +'.png');
	};

var cardBack = 'images/back.jpg'
var $currentCard = null;

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

$(function () {
	cardFront = cardFront.concat(cardFront);
	cardFront = shuffle(cardFront);

	for (var i = 0; i < cardFront.length; i ++) {
		var cardHS = '<div class="col-xs-2 card-hs"><div class="front"><img class="img-responsive" src=' + cardFront[i] + '></div> <div class="back"><img class="img-responsive" src=' + cardBack + '></div></div>';
		$('.container-fluid').append(cardHS);
	};

	// var rows = $('.container-fluid > .col-xs-2');
	// for (var i = 0; i < rows.length; i += 6) {	
	// 	rows.slice(i, i+6).wrapAll('<div class="row row-card"></div>');
	// }
})

var arrCard = [];

$('.card-hs').on('click', function() {
	if (arrCard.length < 2) {
		if (!$(this).hasClass('flipped')) {
			$(this).toggleClass('flipped');
			arrCard.push($(this));
			if (!$currentCard) {
				$currentCard = $(this);
			} else {
				var $that = $(this);
				if ($(this).attr('data-name') !== $currentCard.attr('data-name')) {
					setTimeout(function() {
						$currentCard.toggleClass('flipped');
						$that.toggleClass('flipped');
						$currentCard = null;
						arrCard = [];
					}, 800)
				} else {
					setTimeout(function() {
						$that.css('opacity', '0');
						$currentCard.css('opacity','0');
						$currentCard = null;
						arrCard = [];
					}, 800);
				}
			}
		}
	};
});


