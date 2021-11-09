// >>>>>>>>>>>>>>>>>>>>>> Error 500 <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    let session
    if (!req.session.user && !req.session.lvl) // No session 😡
        session = null
    else // Session 🤑
        session = req.session
    
    //Error 500 route
    return res.status(500).render('error/500', {
        title_page: 'UTNA - Error de Servidor',
        session: session
    })
}

module.exports = {
    root
}