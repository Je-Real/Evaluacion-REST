// >>>>>>>>>>>>>>>>>>>>>> Error 404 <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    let session
    if (!req.session.user && !req.session.lvl) { // No session 😡
        session = null
    } else { // Session 🤑
        session = req.session
    }

    //Error 404 route
    return res.status(404).render('error/404', {session: session})
}

module.exports = {
    root
}