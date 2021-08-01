// >>>>>>>>>>>>>>>>>>>>>> Error 500 <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    //Error 500 route
    return res.status(500).render('/error/500')
}

module.exports = {
    root
}