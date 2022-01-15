const modelUserInfo = require('../models/modelUserInfo')
const DATE = new Date()

// >>>>>>>>>>>>>>>>>>>>>> Control <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
    let session, records = false
    
    if(!req.session.user && !req.session.lvl) { // No session 😡
        session = null
        //Inicio route
        
        return res.status(200).render('inicio', {
            title_page: 'UTNA - Inicio',
            session: session
        })
    } else { // Session 🤑
        session = req.session

        await modelUserInfo.aggregate([
            { $match: { manager: req.session.user } }, {
                $lookup: {
                    from: "evaluations",
                    localField: "_id",
                    foreignField: "_id",
                    as: "eval",
                }
            }, {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            { $arrayElemAt: [ "$eval", 0 ] }, "$$ROOT"
                        ]
                    } 
                }
            }, {
                $unset: [
                    "level", "area",
                    "department", "career",
                    "contract", "b_day",
                    "address", "manager",
                    "eval"
                ]
            }
        ])
        .then(async(dataInfo) => {
            let year = String(DATE.getFullYear())
            records = dataInfo
            
            for(let i in records) {
                if('records' in records[i])
                    if(year in records[i]['records'])
                        records[i]['records'] = 1
                    else
                        records[i]['records'] = 0
                else 
                    records[i]['records'] = 0
            }
        })
        .catch((error) => {
            console.error(error)
            records = false
        })
    }

    //Control route
    return res.status(200).render('tabla', {
        title_page: 'UTNA - Inicio',
        session: session,
        records: records
    })
}

module.exports = {
    root
}