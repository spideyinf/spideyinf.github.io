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




