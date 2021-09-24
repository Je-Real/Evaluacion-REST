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
    var score
    var failure = (question) => {
        return res.end(JSON.stringify({
            msg: 'Error: No se obtuvo calificacion de ' + question,
            resType: 'error',
            notify: true,
            status: 500,
        }))
    }

    switch (req.body.grades.p_1) {
        case 4:
            req.body.grades.p_1 = 25
            break;
        case 3:
            req.body.grades.p_1 = 17.5
            break;
        case 2:
            req.body.grades.p_1 = 12.5
            break;
        case 1:
            req.body.grades.p_1 = 7.5
            break;
        default:
            return failure('p_1')
    }

    switch (req.body.grades.p_1) {
        case 4:
            req.body.grades.p_1 = 25
            break;
        case 3:
            req.body.grades.p_1 = 17.5
            break;
        case 2:
            req.body.grades.p_1 = 12.5
            break;
        case 1:
            req.body.grades.p_1 = 7.5
            break;
        default:
            return failure('p_1')
    }

    switch (req.body.grades.p_1) {
        case 4:
            req.body.grades.p_1 = 25
            break;
        case 3:
            req.body.grades.p_1 = 17.5
            break;
        case 2:
            req.body.grades.p_1 = 12.5
            break;
        case 1:
            req.body.grades.p_1 = 7.5
            break;
        default:
            return failure('p_1')
    }

    switch (req.body.grades.p_1) {
        case 4:
            req.body.grades.p_1 = 25
            break;
        case 3:
            req.body.grades.p_1 = 17.5
            break;
        case 2:
            req.body.grades.p_1 = 12.5
            break;
        case 1:
            req.body.grades.p_1 = 7.5
            break;
        default:
            return failure('p_1')
    }

    switch (req.body.grades.p_1) {
        case 4:
            req.body.grades.p_1 = 25
            break;
        case 3:
            req.body.grades.p_1 = 17.5
            break;
        case 2:
            req.body.grades.p_1 = 12.5
            break;
        case 1:
            req.body.grades.p_1 = 7.5
            break;
        default:
            return failure('p_1')
    }

    switch (req.body.grades.p_1) {
        case 4:
            req.body.grades.p_1 = 25
            break;
        case 3:
            req.body.grades.p_1 = 17.5
            break;
        case 2:
            req.body.grades.p_1 = 12.5
            break;
        case 1:
            req.body.grades.p_1 = 7.5
            break;
        default:
            return failure('p_1')
    }

    switch (req.body.grades.p_1) {
        case 4:
            req.body.grades.p_1 = 25
            break;
        case 3:
            req.body.grades.p_1 = 17.5
            break;
        case 2:
            req.body.grades.p_1 = 12.5
            break;
        case 1:
            req.body.grades.p_1 = 7.5
            break;
        default:
            return failure('p_1')
    }

    switch (req.body.grades.p_1) {
        case 4:
            req.body.grades.p_1 = 25
            break;
        case 3:
            req.body.grades.p_1 = 17.5
            break;
        case 2:
            req.body.grades.p_1 = 12.5
            break;
        case 1:
            req.body.grades.p_1 = 7.5
            break;
        default:
            return failure('p_1')
    }

    switch (req.body.grades.p_1) {
        case 4:
            req.body.grades.p_1 = 25
            break;
        case 3:
            req.body.grades.p_1 = 17.5
            break;
        case 2:
            req.body.grades.p_1 = 12.5
            break;
        case 1:
            req.body.grades.p_1 = 7.5
            break;
        default:
            return failure('p_1')
    }
    
    switch (req.body.grades.p_1) {
        case 4:
            req.body.grades.p_1 = 25
            break;
        case 3:
            req.body.grades.p_1 = 17.5
            break;
        case 2:
            req.body.grades.p_1 = 12.5
            break;
        case 1:
            req.body.grades.p_1 = 7.5
            break;
        default:
            return failure('p_1')
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