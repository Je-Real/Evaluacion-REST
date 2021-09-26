function setCookie(cname, cvalue, exmin) {
    exmin = (exmin != undefined) ? exmin : 1
	const d = new Date()
	d.setTime(d.getTime() + exmin * 10 * 60 * 1000)
	var expires = 'expires=' + d.toGMTString()
	document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/'
}

function getCookie(cname) {
	var name = cname + '='
	var decodedCookie = decodeURIComponent(document.cookie)
	var ca = decodedCookie.split(';')
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i]
		while (c.charAt(0) == ' ') {
			c = c.substring(1)
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length)
		}
	}
	return ''
}

function checkCookie(cname) {
    cname = 'username'
	var result = getCookie(cname)
	if (result.length > 0) {
		showSnack('Status: No', 'warning')
	} else {
		showSnack('Status: '+result, 'info')
    }
}
