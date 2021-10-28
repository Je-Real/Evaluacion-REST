// >>>>>>>>>>>>>>>>>>>>>> Tablas <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    var session
    if(!req.session.user && !req.session.lvl) { // No session 😡
        session = null
    } else { // Session 🤑
        session = req.session
    }

    //Tablas route
    return res.status(200).render('tablas', {session: session})
}

module.exports = {
    root
}