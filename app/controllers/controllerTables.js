// >>>>>>>>>>>>>>>>>>>>>> Tables <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    //Tables route
    return res.status(200).render('tables')
}

module.exports = {
    root
}