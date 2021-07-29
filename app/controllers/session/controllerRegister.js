//Import db model
const path = require('path')
const modelUser = require('../../models/modelUser')
const crypto = require('crypto')

// >>>>>>>>>>>>>>>>>>>>>> Charts <<<<<<<<<<<<<<<<<<<<<<
function root(req, res){
    //Charts route
    return res.status(200).render(path.join(__dirname + '/../../views/session/register'))
}

function signIn(req, res){
    /*
    // Cifrado de Nodejs con CTR
    const crypto = require ( 'crypto ');
    algoritmo const = 'aes-256-cbc ';
    contrast clave = crypto.randomBytes (32);
    const iv = crypto.randomBytes (16);

    funcion encriptar (texto) {

    let cipher = crypto.createCipheriv ( 'aes-256-cbc ', Buffer.from (clave), iv);
    let encrypted = cipher.update (texto);
    cifrado = Buffer.concat ([cifrado, cifrado.final ()]);
    return {iv: iv.toString ( 'hex '), encryptedData: encrypted.toString ( 'hex ')};
    }

    funcion descifrar (texto) {

    let iv = Buffer.from (text.iv, 'hex ');
    let encryptedText = Buffer.from (text.encryptedData, 'hex ');
    dejar descifrar = crypto.createDecipheriv ( 'aes-256-cbc ', Buffer.from (clave), iv);
    dejar descifrado = decipher.update (encryptedText);
    descifrado = Buffer.concat ([descifrado, descifrado.final ()]);
    return decrypted.toString
    }
    */

    if(req.body.user == null)
        return res.status(500).render(path.join(__dirname + '/../../views/session/register'))

    var cKey = crypto.createHmac('sha1', req.body.user).update(req.body.pass).digest('hex')

    console.log('Hash:', cKey)

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