// >>>>>>>>>>>>>>>>>>>>>> Password Recovery <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    //Password Recovery route
    return res.status(200).render('session/password')
}

module.exports = {
    root
}