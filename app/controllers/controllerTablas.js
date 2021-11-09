// >>>>>>>>>>>>>>>>>>>>>> Tablas <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    let session
    if (!req.session.user && !req.session.lvl) { // No session 😡
        session = null
    } else { // Session 🤑
        session = req.session
    }

    //Tablas route
    return res.status(200).render('tablas', {
        title_page: 'UTNA - Tablas',
        session: session
    })
}

module.exports = {
    root
}