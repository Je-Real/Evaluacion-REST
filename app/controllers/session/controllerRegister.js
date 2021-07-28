//Import db model
const path = require('path')
const modelUser = require('../../models/modelUser')

// >>>>>>>>>>>>>>>>>>>>>> Charts <<<<<<<<<<<<<<<<<<<<<<
function root(req, res){
    //Charts route
    return res.status(200).render(path.join(__dirname + '/../../views/session/register'))
}

function signIn(req, res){
    new modelUser(req.body).save()
    .then(data => {
        return res.status(200).render(path.join(__dirname + '/../../views/session/login'))
    })
    .catch(error => res.status(500).send({error}))
}

module.exports = {
    root,
    signIn
}