// >>>>>>>>>>>>>>>>>>>>>> Layout static <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    //Layout static route
    return res.status(200).render('encuesta')
}

module.exports = {
    root
}