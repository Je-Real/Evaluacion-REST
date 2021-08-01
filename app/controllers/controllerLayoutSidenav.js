// >>>>>>>>>>>>>>>>>>>>>> Layout sidebar <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    //Layout sidebar route
    return res.status(200).render('layout-sidenav-light')
}

module.exports = {
    root
}