const modelEvaluation = require('../models/modelEvaluation')
const modelUserInfo = require('../models/modelUserInfo')
const modelArea = require('../models/modelArea')
const modelDepartment = require('../models/modelDepartment')
const modelCareer = require('../models/modelCareer')

const DATE = new Date()
const currYear = String(DATE.getFullYear())

// >>>>>>>>>>>>>>>>>>>>>> Reportes <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
    let hour = DATE.getHours(),
        salutation, session,
        area = [],
        department = [],
        career = [],
        subordinates = []

    if(!req.session.user && !req.session.lvl) { // No session 😡
        session = null
        //Reportes route
        return res.status(200).render('metrics', {
            title_page: 'UTNA - Metricas',
            session: session,
            area: area,
            depa: department,
            care: career,
            subordinates: null,
            hour: hour,
            salutation: salutation
        })
    } else { // Session 🤑
        session = req.session

        if(hour >= 5 && hour <= 12) 
            salutation = `Buen día, ${session.first_name}`
        else if(hour > 12 && hour <= 19)
            salutation = `Buenas tardes, ${session.first_name}`
        else 
            salutation = `Buenas noches, ${session.first_name}`

        await modelArea.aggregate([
            { $match: /*(options[0].length) ? { $or: options[0] } :*/ {} }, {
                $lookup: {
                    from: 'departments',
                    pipeline: [
                        { $match: /*(options[1].length) ? { $or: options[1] } :*/ {} }, {
                            $lookup: {
                                from: 'careers',
                                pipeline: [
                                    { $match: /*(options[2].length) ? { $or: options[2] } :*/ {} },
                                    { $project: { _id: 0, department: 0 } }
                                ],
                                localField: 'n',
                                foreignField: 'department',
                                as: 'careers',
                            }
                        }, { $project: { _id: 0, area: 0 } }
                    ],
                    localField: 'n',
                    foreignField: 'area',
                    as: 'departments',
                }
            }, { $project: { _id: 0 } }
        ]) // Get all areas in DB
        .then((dataInfo) => { //🟢
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
    
            for(let i in dataInfo) {
                area[i] = {
                    n: dataInfo[i]['n'],
                    desc: dataInfo[i]['desc']
                }
                if(dataInfo[i]['departments'] != undefined) {
                    for(let j in dataInfo[i]['departments']) {
                        department.push({
                            n: dataInfo[i]['departments'][j]['n'],
                            area: dataInfo[i]['n'],
                            desc: dataInfo[i]['departments'][j]['desc']
                        })
                        if(dataInfo[i]['departments'] != undefined) {
                            for(let k in dataInfo[i]['departments'][j]['careers']) {
                                career.push({
                                    n: dataInfo[i]['departments'][j]['careers'][k]['n'],
                                    department: dataInfo[i]['departments'][j]['n'],
                                    desc: dataInfo[i]['departments'][j]['careers'][k]['desc']
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

        await modelUserInfo.aggregate([ // Subordinates by default
            { $match: {manager: session.user} },
            { $project: {
                _id: 1,
                first_name: 1,
                last_name: 1,
            } },
        ])
        .then((dataSubs) => {
            subordinates = dataSubs // Get all the subordinates
        })
        .catch((error) => {
            console.error(error)
        })
        .finally(() => {
            //Reportes route
            return res.status(200).render('metrics', {
                title_page: 'UTNA - Metricas',
                session: session,
                lvl: req.session.lvl,
                care: career,
                depa: department,
                area: area,
                subordinates: subordinates,
                hour: hour,
                salutation: salutation
            })
        })
    }
}

function data(req, res) {
    let search = {}, sumTemp,
        year = DATE.getFullYear()
        
    if(req.body._id != null && (req.body._id).trim() != '') {
        search._id = (req.body._id).trim()
        if(req.session.lvl > 1)
            search.manager = req.session.user
    } else if(req.body.area > 0) {
        search.area = req.body.area
        if(req.body.department != null && req.body.department > 0) {
            search.department = req.body.department
            if(req.body.career != null && req.body.career > 0) search.career = req.body.career
        }
    }
    else {
        search.manager = req.session.user
    }

    modelEvaluation.aggregate([
        { $lookup: {
            from: 'user_infos',
            pipeline: [
                { $match : search },
                { $project: {
                        first_name: 1,
                        last_name: 1,
                } }
            ],
            localField: '_id',
            foreignField: '_id',
            as: 'info',
        } }, {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: [
                        { $arrayElemAt: [ '$info', 0 ] }, '$$ROOT'
                    ]
                }
            }
        }, { 
            $project: {
                _id : { $cond: { if: { $eq: [ '$info', [] ] }, then: '$$REMOVE', else: '$_id' } },
                records : { $cond: { if: { $eq: [ '$info', [] ] }, then: '$$REMOVE', else: '$records' } },
                first_name : { $cond: { if: { $and: [ { $eq: [ '$info', [] ] }, { $ne: ['$first_name', null] } ] }, then: '$$REMOVE', else: '$first_name' } },
                last_name : { $cond: { if: { $and: [ { $eq: [ '$info', [] ] }, { $ne: ['$last_name', null] } ] }, then: '$$REMOVE', else: '$last_name' } },
                //Get field directly from array = fieldExample: { $arrayElemAt: [ '$fieldExample.fieldInside', 0 ] }
            }
        }
    ])
    .then(async (data) => { //🟢
        if(data) {
            // filter empty objects
            data = data.filter(value => Object.keys(value).length !== 0)
    
            let average = 0, sumTemp = 0,
                years = [], records =  [], subordinates = [],
                histCounter =  [[0, 0, 0, 0, 0],[0, 0, 0, 0, 0]],
                divideBy = 0
    
            if(req.body._id == null || req.body._id == undefined)
                await modelUserInfo.aggregate([
                    { $match: search },
                    { $project: {
                        _id: 1,
                        first_name: 1,
                        last_name: 1,
                    } },
                ])
                .then((dataSubs) => {
                    subordinates = dataSubs // Get all the subordinates
                })
                .catch((error) => {
                    console.error(error)
                })
            else subordinates = null
        
            for(let i=0; i<5; i++) {
                let yrs = String(parseInt(year)-(4-i))
            
                years[i] = yrs
                for(let j in data) {
                    if('records' in data[j]) {
                        if(String(yrs) in data[j].records) {
                            if(!('disabled' in data[j].records[yrs])) {
                                histCounter[0][i] += data[j].records[String(yrs)].score
                                histCounter[1][i]++
                            }
                        }
                    }
                }
                histCounter[0][i] = parseFloat((histCounter[0][i])).toFixed(2)
                
                records[i] = (histCounter[0][i] === 0 || histCounter[1][i] === 0)
                    ? 0 : parseFloat((histCounter[0][i] / histCounter[1][i]).toFixed(1))
                sumTemp += records[i]
                
                if(records[i] != 0) divideBy++
            }
            // Get average just for only for years with evaluations
            average = parseFloat((sumTemp / divideBy).toFixed(1))
        
            return res.end(JSON.stringify({
                data: {
                    total: (average === NaN) ? null : average,
                    log: {
                        years: years,
                        records: records
                    },
                    subordinates: subordinates
                },
                status: 200,
            }))
        } else return res.end(JSON.stringify({
            data: null,
            status: 404,
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

function getAllOf(req, res) {
    let search = {}, uAggregate

    search['records.'+currYear] = { $exists: true }
    uAggregate = [
        { 
            $lookup: {
                from: 'evaluations',
                pipeline: [
                    { $match: search },
                    { $group: {
                        _id: `$records.${currYear}.${req.body.search}`,
                        total: { $sum: `$records.${currYear}.score` },
                        length: { $sum: 1 }
                    } },
                    { $lookup: {
                        from: `${req.body.search}s`,
                        pipeline: [ { $unset: ['n', '_id', 'desc'] } ],
                        localField: '_id',
                        foreignField: 'n',
                        as: `${req.body.search}_`
                    } },
                    { $replaceRoot: {
                        newRoot: {
                            $mergeObjects: [
                                { $arrayElemAt: [`$${req.body.search}_`, 0] },
                                '$$ROOT'
                            ]
                        }
                    } },
                    { $unset: [`${req.body.search}_`] }
                ],
                localField: 'n',
                foreignField: `records.${currYear}.${req.body.search}`,
                as: '_avg'
            }
        }, {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: [ 
                        { $arrayElemAt: ['$_avg', 0] },
                        '$$ROOT'
                    ]
                }
            }
        }, {
            $set: {
                total: {
                    $cond: [
                        { $ifNull: ['$total', false] },
                        '$total',
                        0
                    ]
                },
                length: {
                    $cond: [
                        { $ifNull: ['$length', false] },
                        '$length',
                        0
                    ]
                },
                _id: '$n'
            }
        }
    ]

    const failure = () => {
        return res.end(JSON.stringify({
            msg: 'La búsqueda no coincide dentro de los parámetros.',
            status: 404,
            noti: true,
            notiType: 'error'
        }))
    }

    const success = (data) => {
        return res.end(JSON.stringify({
            data: data,
            status: 200
        }))
    }
    
    switch (req.body.search) {
        case 'area':
            uAggregate.push({ $unset: ['_avg', 'n'] })
            modelArea.aggregate(uAggregate)
            .then(data => success(data))
            .catch(error => { console.log(error); failure() })
            break
        case 'department':
            uAggregate.push({ $unset: ['_avg', 'n', 'area'] })
            modelDepartment.aggregate(uAggregate)
            .then(data => success(data))
            .catch(error => { console.log(error); failure() })
            break
        case 'career':
            uAggregate.push({ $unset: ['_avg', 'n', 'department'] })
            modelCareer.aggregate(uAggregate)
            .then(data => success(data))
            .catch(error => { console.log(error); failure() })
            break
        default:
            failure()
            break
    }
}

module.exports = {
    root,
    data,
    getAllOf
}