//Operation Function for Numberic-button and Function-button (+ - x ÷ =)
$(".num").click(function() {
	var number = $(this).val();
	$("#readout").val(function (n, c) {
		return c + number;
	});
});

$(".func").click(function() {
	var number = $(this).val();
	$("#readout").val(function (n, c) {
		return c + number;
	});
});

//Operation Function for Misc-button
function erase() {
	$('#readout').val("");
}

function sqrt() {
	var n = eval($('#readout').val());
	$('#readout').val(Math.sqrt(n));
}

function sqr() {
	var n = eval($('#readout').val());
	$('#readout').val(Math.pow(n, 2));
}

function reverse() {
	var a = eval($('#readout').val());
	$('#readout').val(-a);
}

function hundredPercent() {
	var a = eval($('#readout').val());
	$('#readout').val(a/100);
}

function factorialize() {
	var n = $('#readout').val();
	var fac = 1;
	for (var i = 1; i <= n; i++) {
		fac*=i;
	}
	$('#readout').val(fac);
}

function equal() {
	var final = $('#readout').val();
	$('#readout').val(eval(final));
}

//Change theme
$('.change').click(function() {
	$('body').toggleClass('new-theme');
});

//Toggle text of Change button and h1
$(function() {
	$('.change').click(function () {
		$(this).text(function(i, text) {
			return text === 'Simple theme' ? 'Apple theme' : 'Simple theme';
		})
		$('.theme-name').text(function(i, text) {
			return text === 'Apple theme' ? 'Simple theme' : 'Apple theme';
		})
	});
})

