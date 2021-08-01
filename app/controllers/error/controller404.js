// >>>>>>>>>>>>>>>>>>>>>> Error 404 <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    //Error 404 route
    return res.status(404).render('error/404')
}

module.exports = {
    root
}