const modelEvaluation = require('../models/modelEvaluation')

// >>>>>>>>>>>>>>>>>>>>>> Encuesta static <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    if(!req.session.user && !req.session.lvl) {
        // No session 😡
        session = null
    } else {
        // Session 🤑
        session = {
            user: req.session.user,
            lvl: req.session.lvl,
            name: req.session.name
        }
    }

    //Encuesta static route
    return res.status(200).render('encuesta', {session: session})
}

function post(req, res) {
    var grade = null

    for (grade in req.body.grades) {
        console.log(req.body.grades)
    }

    return res.end(JSON.stringify({
        msg: 'Test hecho',
        resType: 'warning',
        status: 500,
    }))
}

module.exports = {
    root,
    post
}