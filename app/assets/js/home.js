window.addEventListener('load', async(e) => {
    setTimeout(async() => {
        $e('#floatingLogin').classList.replace('hide', 'show')
    }, 200)

    $a('input').forEach((node) => {
        //Capture Enter key in inputs
        document.addEventListener('keypress', (e) => {
            var code = e.key || e.code;
            if(code === 'Enter') login()
        })
    })
})