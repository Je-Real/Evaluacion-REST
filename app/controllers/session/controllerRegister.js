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
    await modelUser.find({user:req.body.user})
    .then(data => {
        if(data.length) { //if data 👍
            return console.log('Existe usuario', data)
        } else { //if no data 🥶
            console.log('No data')
        }
    })
    .catch(error => { //if error 🤬
        //req.body.error = error
        console.log('Error:', error)
    })

    var cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv)
    var encrypted = cipher.update(req.body.pass)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    req.body.pass = encrypted.toString('hex')

    for(const data in req.body){
        req.body[data] = String(req.body[data]).trim()
        if(req.body[data] == null || req.body[data] == '')
            return res.status(200).redirect('/evaluacion/register')
    }

    new modelUser(req.body).save()
    .then(data => {
        console.log(data)
        return res.status(200).redirect('/evaluacion/login')
    })
    .catch(error => res.status(500).send({error}))
}

module.exports = {
    root,
    signIn
}