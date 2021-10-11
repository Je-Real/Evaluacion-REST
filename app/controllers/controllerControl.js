const modelEvaluation = require('../models/modelEvaluation')
const modelUserInfo = require('../models/modelUserInfo')

// >>>>>>>>>>>>>>>>>>>>>> Control <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
    var session, records = false
    var lvl = (req.session.lvl >= 5) ? req.session.lvl : req.session.lvl+1,
        area = req.session.area,
        depa = req.session.department
    
    if(!req.session.user && !req.session.lvl) { // No session 😡
        session = null
    } else { // Session 🤑
        session = req.session

        await modelUserInfo.find(
            { level: parseInt(lvl), area: parseInt(area) },
            { _id:1, first_name:1, last_name:1, area:1 }
        )
        .then(async(dataInfo) => {
            var search = {}
            if(req.session.lvl <= 1) search.area = area
            else {
                search.area = parseInt(area)
                search.department = parseInt(depa)
            }
    
            await modelEvaluation.find(search, { _id:1, records:1 })
            .then((dataEval) => {
                for(let i=0; i<dataInfo.length; i++) {
                    dataInfo[i]['area'] = false
                    for(let j=0; j<dataEval.length; j++) {
                        if(dataInfo[i]['_id'] == dataEval[j]['_id']) {
                            dataInfo[i]['area'] = true
                            break
                        }
                    }
                }
                records = dataInfo
            })
            .catch((error) => {
                console.error(error)
                records = false
            })
        })
        .catch((error) => {
            console.error(error)
            records = false
        })
    }

    //Control route
    return res.status(200).render('control', { 
        session: session,
        records: records
    })
}

module.exports = {
    root
}