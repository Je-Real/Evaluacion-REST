//Import db model
const path = require('path')
const modelUser = require('../../models/modelUser')
const crypto = require('crypto');

// >>>>>>>>>>>>>>>>>>>>>> Charts <<<<<<<<<<<<<<<<<<<<<<
function root(req, res){
    //Charts route
    return res.status(200).render(path.join(__dirname + '/../../views/session/register'))
}

function signIn(req, res){
    var iv = crypto.randomBytes(16)

    //var mykey = crypto.createCipher('aes-128-cbc', 'mypassword');
    var key = crypto.createCipheriv('aes-256-gcm', crypto.randomBytes(32), iv)
    var eKey = key.update(req.body.pass, 'utf8', 'hex')
    ekey += key.final('hex');

    console.log('Encrypted:', eKey)


    var mykey = crypto.createDecipheriv('aes-128-cbc', crypto.randomBytes(32), iv);
    var mystr = mykey.update(eKey, 'hex', 'utf8')
    mystr += mykey.final('utf8');

    console.log('Decrypted:', mystr)

    if(req.body.user == null)
        return res.status(500).render(path.join(__dirname + '/../../views/session/register'))

    //var cKey = crypto.createHmac('sha1', req.body.user).update(req.body.pass).digest('hex')

    //console.log('Hash:', cKey)

    /*new modelUser(req.body).save()
    .then(data => {
        return res.status(200).render(path.join(__dirname + '/../../views/session/login'))
    })
    .catch(error => res.status(500).send({error}))*/
}

module.exports = {
    root,
    signIn
}