async function setCookie(cname, cvalue) {
	if(cname == undefined || cvalue == undefined) {
		console.error('Cookies save empty')
		throw false
	}

	const d = new Date()
	d.setTime(d.getTime() + 7*24*60*60*1000)
	var expires = 'expires=' + d.toGMTString()
	try {
		document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/'
		return true
	} catch (error) {
		console.error(error)
		throw false
	}
}

async function getCookie(cname) {
	var name = cname + '='
	if (cname == 0) {
		var cookieSession, cookieGoTo, ini

		ini = [document.cookie.search('{'), (document.cookie.search('}'))+1]
		cookieSession = document.cookie.slice(ini[0], ini[1])

		await getCookie('requested-page')
		.then((data) => { cookieGoTo = data })
		.catch((error) => { cookieGoTo = undefined })

		return [cookieSession, cookieGoTo]
	}

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
	throw false
}

async function checkCookie(cname) {
	if (cname == undefined) return console.log('Cookies jar empty')
	var result
	
	await getCookie(cname)
		.then(async (data) => {
			if (data.length > 0) result = true
			else result = false
		})
		.catch((error) => {
			result = false
			console.error(error)
		})

	if(result) return true
	else throw false
}

async function eatCookies() {
	try {
		document.cookie.split(";").forEach(function(c) {
			document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
		})
		sessionStorage.clear()
		return true
	} catch(error) {
		console.error(error)
		throw false
	}
}