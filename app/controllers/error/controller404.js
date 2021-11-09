// >>>>>>>>>>>>>>>>>>>>>> Error 404 <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {//Error 404 route
    let session
    if (!req.session.user && !req.session.lvl) // No session 😡
        session = null
    else // Session 🤑
        session = req.session
    
    return res.status(404).render('error/404', {
        title_page: 'UTNA - Pagina inexistente',
        session: session
    })
}

module.exports = {
    root
}