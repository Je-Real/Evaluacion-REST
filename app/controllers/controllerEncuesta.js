// >>>>>>>>>>>>>>>>>>>>>> Layout static <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    //Layout static route
    return res.status(200).render('layout-static')
}

module.exports = {
    root
}