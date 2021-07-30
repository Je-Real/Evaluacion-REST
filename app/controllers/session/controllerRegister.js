//Import db model
const path = require('path')
const modelUser = require('../../models/modelUser')
const crypto = require('crypto')
const key = crypto.randomBytes(32)
const iv = crypto.randomBytes(16)

// >>>>>>>>>>>>>>>>>>>>>> Charts <<<<<<<<<<<<<<<<<<<<<<
function root(req, res){
    //Charts route
    return res.status(200).render(path.join(__dirname + '/../../views/session/register'))
}

async function signIn(req, res){
    modelUser.find(req.body.user)
    .then(data => {
        if(data.length) { //if data 👍
            return console.log('Existe usuario', data)
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
        console.log('Error')
    })

    var cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv)
    var encrypted = cipher.update(req.body.pass)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    await console.log('Encrypted:', encrypted.toString('hex'))

    if(req.body.user == null)
        return res.status(500).render(path.join(__dirname + '/../../views/session/register'))

    new modelUser(req.body).save()
    .then(data => {
        console.log(data)
        return res.status(200).render(path.join(__dirname + '/../../views/session/login'))
    })
    .catch(error => res.status(500).send({error}))
}

module.exports = {
    root,
    signIn
}