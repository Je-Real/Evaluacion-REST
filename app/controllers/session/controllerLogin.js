//Import db model
const path = require('path')
const modelUser = require('../../models/modelUser')
const crypto = require('crypto')
const key = crypto.randomBytes(32)
const iv = crypto.randomBytes(16)

// >>>>>>>>>>>>>>>>>>>>>> Charts <<<<<<<<<<<<<<<<<<<<<<
function root(req, res){
    //Charts route
    return res.status(200).render(path.join(__dirname + '/../../views/session/login'))
}

function logIn(req, res){
    modelUser.find(req.body.user)
    .then(data => {
        if(data.length) { //if data 👍
            console.log(data)
            //req.body.userdata = data
        }
        else { //if no data 🥶
            console.log('No data')
            //return next()
        }
    })
    .catch(error => { //if error 🤬
        //req.body.error = error
        //next()
        console.log('Error:', error)
    })

    /*let iv = Buffer.from(text.iv, 'hex');
    var decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(hash.iv, 'hex'));
    var decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
    return decrpyted.toString();*/

    return res.status(200).render(path.join(__dirname + '/../../views/session/login'))

    //if(req.body.userdata.user)
}

module.exports = {
    root,
    logIn
}