//Import db model
const path = require('path')
const modelUser = require('../../models/modelUser')
const crypto = require('crypto')
const key = crypto.randomBytes(32)
const iv = crypto.randomBytes(16)
const ivStn = 'abcdefghijklmnop'

// >>>>>>>>>>>>>>>>>>>>>> Charts <<<<<<<<<<<<<<<<<<<<<<
function root(req, res){
    //Charts route
    return res.status(200).render(path.join(__dirname + '/../../views/session/login'))
}

function logIn(req, res){
    modelUser.find({user:req.body.user})
    .then(data => {
        if(data.length) { //if data 👍
            console.log(Buffer.from(iv, 'hex').toString())

            /*let encryptedText = Buffer.from(data[0].pass, 'hex')
            let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv)
            let decrypted = decipher.update(encryptedText)
            decrypted = Buffer.concat([decrypted, decipher.final()])
            console.log(decrypted)*/
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

    return res.status(200).redirect('/evaluacion/login')

    //if(req.body.userdata.user)
}

module.exports = {
    root,
    logIn
}