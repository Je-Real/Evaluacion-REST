function copyInfo(info) {
    let copyText

    if(info === 1) copyText = $('#data-user-infos').text().trim()
    else if(info === 2) copyText = $('#data-users').text().trim()
    else return

	navigator.clipboard.writeText(copyText)
	showSnack(
        (lang == 0) ? 'Texto copiado' : 'Text copied',
        null, 'info'
    )
}
