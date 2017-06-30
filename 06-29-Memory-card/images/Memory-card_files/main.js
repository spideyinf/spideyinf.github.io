var cardFront = [];
	//Create card front
	for (var i = 1; i < 6; i ++) {
		cardFront.push('images/f' + [i] +'.png');
	};

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

$(function () {
	cardFront = cardFront.concat(cardFront);
	cardFront = shuffle(cardFront);

	for (var i = 0; i < cardFront.length; i ++) {
		var cardHS = '<div class="col-xs-3"><div class="card-hs" data-name="' + cardFront + '" onclick="flip(this)"><div class="front"><img class="img-responsive" src=' + cardFront[i] + '></div><div class="back"><img class="img-responsive" src=' + cardBack + '></div></div></div>';
		$('.row').append(cardHS);
	};

	// var rows = $('.container-fluid > .col-xs-2');
	// for (var i = 0; i < rows.length; i += 6) {	
	// 	rows.slice(i, i+6).wrapAll('<div class="row row-card"></div>');
	// }
})

function flip(card) {
	$(card).toggleClass('flipped');
	if (!current) {
		current = $(card);
	} else {
		if (current.attr('data-name') != $(card).attr('data-name')) {
			setTimeout(function() {
				console.log('Khac nhau');
				current.toggleClass('flipped');
				$(card).toggleClass('flipped');
				current = null;
			}, 800);


		} else {
			console.log('Giong nhau');
			current = null;
		}
	}
}

$(function() {

});

