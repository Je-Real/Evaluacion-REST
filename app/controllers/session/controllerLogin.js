//Import db model
const path = require('path')
const modelUser = require('../../models/modelUser')

// >>>>>>>>>>>>>>>>>>>>>> Charts <<<<<<<<<<<<<<<<<<<<<<
function root(req, res){
    //Charts route
    return res.status(200).render(path.join(__dirname + '/../../views/session/login'))
}

function search(req, res){
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
        console.log('Error')
    })

    return res.status(200).render(path.join(__dirname + '/../../views/session/register'))

    //if(req.body.userdata.user)
}

module.exports = {
    root,
    search
}