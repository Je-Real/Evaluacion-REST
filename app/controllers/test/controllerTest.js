// >>>>>>>>>>>>>>>>>>>>>> Test <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    //Test route
    var r
    try{
        r = res.status(200).render('test/testing')
    }
    catch {
        r = res.status(200).redirect('/404')
    }

    return r
}

module.exports = {
    root
}