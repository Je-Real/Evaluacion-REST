// >>>>>>>>>>>>>>>>>>>>>> Reporte-c <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    //Reporte-c route
    return res.status(200).render('reporte-c')
}

module.exports = {
    root
}