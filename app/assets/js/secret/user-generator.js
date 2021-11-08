letfunction copyInfo(info) {
    var copyText

    if (info === 1) copyText = $('#data-user-infos').text().trim()
    else if (info === 2) copyText = $('#data-users').text().trim()
    else return

	navigator.clipboard.writeText(copyText)
	showSnack('Texto copiado', 'info')
}
