// >>>>>>>>>>>>>>>>>>>>>> Tablas <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    if(!req.session.user && !req.session.lvl) {
        // No session 😡
        session = null
    } else {
        // Session 🤑
        session = {
            user: req.session.user,
            lvl: req.session.lvl,
            name: req.session.name
        }
    }

    //Tablas route
    return res.status(200).render('tablas', {session: session})
}

module.exports = {
    root
}