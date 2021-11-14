const modelEvaluation = require('../models/modelEvaluation')
const modelArea = require('../models/modelArea')
const d = new Date()

// >>>>>>>>>>>>>>>>>>>>>> Reportes <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
    let hour = d.getHours(),
        s, session,
        area = [],
        department = [],
        career = [],
        options = [{}, {}]


    if (hour >= 5 && hour <= 12) { s = 'Buen dia' } 
    else if (hour > 12 && hour <= 19) { s = 'Buenas tardes' }
    else { s = 'Buenas noches' }

    if (!req.session.user && !req.session.lvl) { // No session 😡
        session = null
    } else { // Session 🤑
        session = req.session
            
        if (session.lvl > 1) {
            options[0] = { n: session.area }
            if (session.department > 0) {
                options[1] = { n: session.department }
            }
        }
    
        await modelArea.aggregate([
            { $match: options[0] }, {
                $lookup: {
                    from: "departments",
                    pipeline: [
                        { $match: options[1] }, {
                            $lookup: {
                                from: "careers",
                                pipeline: [
                                    { $project: { _id: 0, department: 0 } }
                                ],
                                localField: "n",
                                foreignField: "department",
                                as: "careers",
                            }
                        }, { $project: { _id: 0, area: 0 } }
                    ],
                    localField: "n",
                    foreignField: "area",
                    as: "departments",
                }
            }, { $project: { _id: 0 } }
        ]) // Get all areas in DB
        .then((data) => { //🟢
            /* We get as result a JSON like this
             *  { 
             *      n: 0,  << Area number >>
             *      desc: 'Area 0',  << Area name >>
             *      departments: [ 
             *          { 
             *              n: 1,  << Department number >>
             *              desc: 'Dep 1',  << Department name >>
             *              careers: [ 
             *                  { 
             *                      n: 2,  << Career number >>
             *                      desc: 'Career 2'  << Career name >>
             *                  }
             *              ]
             *          }
             *      ]
             *  }
             */
    
            for (let i in data) {
                area[i] = {
                    n: data[i]['n'],
                    desc: data[i]['desc']
                }
                if (data[i]['departments'] != undefined) {
                    for (let j in data[i]['departments']) {
                        department.push({
                            n: data[i]['departments'][j]['n'],
                            area: data[i]['n'],
                            desc: data[i]['departments'][j]['desc']
                        })
                        if (data[i]['departments'] != undefined) {
                            for (let k in data[i]['departments'][j]['careers']) {
                                career.push({
                                    n: data[i]['departments'][j]['careers'][k]['n'],
                                    department: data[i]['departments'][j]['n'],
                                    desc: data[i]['departments'][j]['careers'][k]['desc']
                                })
                            }
                        }
                    }
                }
            }
        })
        .catch((error) => { //🔴
            console.error(error)
        })
    }

    //Reportes route
    return res.status(200).render('metricas', {
        title_page: 'UTNA - Metricas',
        session: session,
        care: career,
        depa: department,
        area: area,
        hour: hour,
        s: s
    })
}

function data(req, res) {
    let search = { manager: req.session.user }, empty = false, sumTemp,
        year = d.getFullYear()

    if (req.body.area > 0) {
        search.area = req.body.area
        if (req.body.department > 0) {
            search.department = req.body.department
            if (req.body.career > 0) search.career = req.body.career
        }
    } else {
        empty = '[Report] Empty/Auto query'
    }

    modelEvaluation.aggregate([
        {
            $lookup: {
                from: "user_infos",
                pipeline: [
                    { $match : search },
                    {
                        $project: {
                            first_name: 1,
                            last_name: 1,
                            area: 1,
                            department: 1,
                            career: 1,
                        }
                    }
                ],
                localField: "_id",
                foreignField: "_id",
                as: "info",
            }
        }, {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: [
                        { $arrayElemAt: [ "$info", 0 ] }, "$$ROOT"
                    ]
                } 
            }
        }, { 
            $project: {
                _id : { $cond: { if: { $eq: [ "$info", [] ] }, then: '$$REMOVE', else: '$_id' } },
                records : { $cond: { if: { $eq: [ "$info", [] ] }, then: '$$REMOVE', else: '$records' } },
                first_name : { $cond: { if: { $and: [ { $eq: [ "$info", [] ] }, { $ne: ['$first_name', null] } ] }, then: '$$REMOVE', else: '$first_name' } },
                last_name : { $cond: { if: { $and: [ { $eq: [ "$info", [] ] }, { $ne: ['$last_name', null] } ] }, then: '$$REMOVE', else: '$last_name' } },
                area : { $cond: { if: { $and: [ { $eq: [ "$info", [] ] }, { $ne: ['$area', null] } ] }, then: '$$REMOVE', else: '$area' } },
                department : { $cond: { if: { $and: [ { $eq: [ "$info", [] ] }, { $ne: ['$department', null] } ] }, then: '$$REMOVE', else: '$department' } },
                career : { $cond: { if: { $and: [ { $eq: [ "$info", [] ] }, { $ne: ['$career', null] } ] }, then: '$$REMOVE', else: '$career' } },
            }
        }
    ])
    .then((data) => { //🟢
        let average = 0, sumTemp = 0,
            years = [], records =  [],
            histCounter =  [[0, 0, 0, 0, 0],[0, 0, 0, 0, 0]]
    
        for (let i=0; i<5; i++) {
            let currYear = String(parseInt(year)-(4-i))
        
            years[i] = currYear
            for (let j in data) {
                if ('records' in data[j]) {
                    if (String(currYear) in data[j].records) {
                        histCounter[0][i] += data[j].records[String(currYear)]
                        histCounter[1][i]++
                    }
                }
            }
            histCounter[0][i] = parseFloat((histCounter[0][i]).toFixed(2))
            
            records[i] = (histCounter[0][i] === 0 || histCounter[1][i] === 0)
                ? 0 : parseFloat((histCounter[0][i] / histCounter[1][i]).toFixed(1))
            sumTemp += records[i]
        }
        average = parseFloat((sumTemp / 5).toFixed(1))
    
        return res.end(JSON.stringify({
            data: {
                total: average,
                log: {
                    years: years,
                    records: records
                }
            },
            console: empty,
            status: 200,
        }))
    })
    .catch((error) => { //🔴
        console.error(error)
        return res.end(JSON.stringify({
            msg: 'Algo salio mal.\n\r¡No te alarmes! Todo saldra bien.',
            status: 404,
            noti: true,
            notiType: 'error',
            error: error
        }))
    })
}


module.exports = {
    root,
    data
}