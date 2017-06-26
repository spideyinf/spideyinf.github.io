function add(val) {
	document.getElementById('readout').value += val;
}

function erase() {
	return document.getElementById('readout').value = "";
}

function sqrt() {
	var n = eval(document.getElementById('readout').value);
	return document.getElementById('readout').value = Math.sqrt(n);
}

function sqr() {
	var n = eval(document.getElementById('readout').value);
	return document.getElementById('readout').value = Math.pow(n, 2);
}

function reverse() {
	var a = eval(document.getElementById('readout').value);
	return document.getElementById('readout').value = -a;
}

function hundredPercent() {
	var a = eval(document.getElementById('readout').value);
	return document.getElementById('readout').value = a/100;
}

function factorialize() {
	var n = document.getElementById('readout').value;
	var fac = 1;
	for (var i = 1; i <= n; i++) {
		fac*=i;
	}
	return document.getElementById('readout').value = fac;
}

function equal() {
	var final = document.getElementById('readout').value;
	return document.getElementById('readout').value = eval(final);
}

