// >>>>>>>>>>>>>>>>>>>>>> Charts <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    //Charts route
    return res.status(200).render('charts')
}

module.exports = {
    root
}