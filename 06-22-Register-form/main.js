(function createYears() {
	var yearList = $('#year');
	var input = "";
	var d = new Date();
	for (var i = d.getFullYear(); i >= 1900 ; i --) {
		input = '<option value='+ i + '>' + i + '</option>';
		yearList.append(input);
	}
	return yearList;
})();

//Confirm-password
var pass = document.getElementById('password');
var confirmPass = document.getElementById('confirm-password');

function validatePassword(){
	if (pass.value != confirmPass.value) {
		confirmPass.setCustomValidity("Passwords do not match!");
	} else {
		confirmPass.setCustomValidity('');
	}
}
pass.onchange = validatePassword;
confirmPass.onkeyup = validatePassword;

//Validation

$('#form-register').on('submit', function() {
	var isValid = true;
	if ($('#fullname').val().trim() == '') {
		$('#fullname').next('span').text('Fullname is empty');
		// $('#error').text('Fullname is empty'); //Call directly
		isValid = false;
	} else {
		$('#fullname').next('span').text('');
	}

	if ($('#email').val().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/) == null) {
		$('#email').next('span').text('Email is invalid');
		isValid = false;
	} else {
		$('#email').next('span').text('');
	}

	return isValid;
});

