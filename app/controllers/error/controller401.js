// >>>>>>>>>>>>>>>>>>>>>> Error 401 <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    //Error 401 route
    return res.status(401).render('error/401')
}

module.exports = {
    root
}