// >>>>>>>>>>>>>>>>>>>>>> Error 401 <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    let session
    if(!req.session._id && !req.session.category) // No session 😡
        session = null
    else // Session 🤑
        session = req.session

    //Error 401 route
    return res.status(401).render('error/401', {
        title_page: 'UTNA - Error 401',
        session: session
    })
}

module.exports = {
    root
}