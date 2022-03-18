function copyInfo(info) {
    let copyText

    if(info === 1) copyText = $e('#data-user-infos').innerHTML.trim()
    else if(info === 2) copyText = $e('#data-users').innerHTML.trim()
    else return

	navigator.clipboard.writeText(copyText)
	showSnack(
        (lang == 0) ? 'Texto copiado' : 'Text copied',
        null, 'info'
    )
}
