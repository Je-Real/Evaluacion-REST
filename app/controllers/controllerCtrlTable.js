const pdf = require('pdfjs')
const fs = require('fs')
const path = require('path')

const modelUserInfo = require('../models/modelUserInfo')
const DATE = new Date()
const year = String(DATE.getFullYear())

const weighting = require('../controllers/controllerEvaluation').weighting

// >>>>>>>>>>>>>>>>>>>>>> Control <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
    let session, records = false
    
    if(!req.session.user && !req.session.lvl) { // No session 😡
        session = null
        //Inicio route
        
        return res.status(200).render('home', {
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
    return res.status(200).render('ctrl_table', {
        title_page: 'UTNA - Inicio',
        session: session,
        records: records
    })
}

async function pdfEvalFormat(req, res) {
    const userID = req.params.id

    await modelUserInfo.aggregate([
        { $match: { _id: userID } }, {
            $lookup: {
                from: 'evaluations', 
                pipeline: [ { $unset: ['_id'] } ], 
                localField: '_id', 
                foreignField: '_id', 
                as: 'evaluations'
            }
        }, {
            $lookup: {
                from: 'user_infos', 
                pipeline: [{
                    $unset: [ 
                        'level', 'b_day', 'address', 'manager', 
                        'area', 'department', 'career', 'contract'
                    ]
                }],
                localField: 'manager', 
                foreignField: '_id', 
                as: 'mngr_info'
            }
        }, {
            $lookup: {
                from: 'areas', 
                pipeline: [
                    { $unset: [ '_id', 'n' ] },
                    { $project: { area: '$desc' } }
                ], 
                localField: 'area', 
                foreignField: 'n', 
                as: 'area_'
            }
        }, {
            $lookup: {
                from: 'departments', 
                pipeline: [
                    { $unset: [ '_id', 'n' ] },
                    { $project: { department: '$desc' } }
                ], 
                localField: 'department', 
                foreignField: 'n', 
                as: 'department_'
            }
        }, {
            $lookup: {
                from: 'careers', 
                pipeline: [
                    { $unset: [ '_id', 'n' ] },
                    { $project: { career: '$desc' } }
                ], 
                localField: 'career', 
                foreignField: 'n', 
                as: 'career_'
            }
        }, {
            $lookup: {
                from: 'contracts', 
                pipeline: [ 
                    { $unset: [ '_id', 'n' ] },
                    { $project: { contract: '$desc' } }
                ], 
                localField: 'contract', 
                foreignField: 'n', 
                as: 'contract_'
            }
        }, {
            $unset: [ 'area', 'department', 'career', 'contract' ]
        }, {
            $replaceRoot: {
                newRoot: { 
                    $mergeObjects: [
                        { $arrayElemAt: [ '$area_', 0 ] },
                        { $arrayElemAt: [ '$department_', 0 ] },
                        { $arrayElemAt: [ '$career_', 0 ] },
                        { $arrayElemAt: [ '$contract_', 0 ] },
                        { $arrayElemAt: [ '$evaluations', 0 ] },
                        '$$ROOT'
                    ]
                }
            }
        }, {
            $set: { manager: { $arrayElemAt: [ '$mngr_info', 0 ] } }
        }, {
            $unset: [
                'evaluations', 'mngr_info', 'area_',
                'department_', 'career_', 'contract_',
                'level', 'b_day', 'address'
            ]
        }
    ])
    .then(async([data]) => {
        if(data != undefined) {
            /**
             * Example of data to retrieve
                [
                  {
                    _id: 'ID',
                    first_name: 'NAME',
                    last_name: 'NAME',
                    area: 'AREA',
                    department (?): 'DEPARTMENT',
                    career (?): 'CAREER',
                    contract: 'CONTRACT',
                    records: { '2022': { score: 100, answers: [ ..11 positions.. ] } },
                    manager: {
                      _id: 'MANAGER ID',
                      first_name: 'MANAGER NAME',
                      last_name: 'MANAGER NAME'
                    }
                  }
                ]
             */

            const doc = new pdf.Document({
                width:   792,
                height:  612
            })
            const ext_1 = new pdf.ExternalDocument(
                fs.readFileSync(path.join(__dirname, '../assets/templates/formato-evaluacion-1.pdf'))
            )
            const ext_2 = new pdf.ExternalDocument(
                fs.readFileSync(path.join(__dirname, '../assets/templates/formato-evaluacion-2.pdf'))
            )
            const ext_3 = new pdf.ExternalDocument(
                fs.readFileSync(path.join(__dirname, '../assets/templates/formato-evaluacion-3.pdf'))
            )
        
            let date_time = new Date(Date.now()),
                dateFormated = date_time.getDate()+'/'+(date_time.getMonth()+1)+'/'+date_time.getFullYear(),
                answers = data.records[year].answers,
                yAnchor, xAnchor, total = 0, tempScore

            const printAnswers = (numFactor, yMargin = 2, result = false) => {
                if(numFactor > 0) {                    
                    doc.cell({ width: 2.95*pdf.cm, x: xAnchor+((answers[numFactor-1]-1)*2.95*pdf.cm), y: yAnchor -= yMargin*pdf.cm })
                    .text({ textAlign: 'center', fontSize: 7 }).add('X')
                    
                    tempScore = weighting(numFactor, answers[numFactor-1])
                    total += tempScore
                    
                    doc.cell({ width: 2.95*pdf.cm, x: xAnchor+((answers[numFactor-1]-1)*2.95*pdf.cm), y: yAnchor - 0.6*pdf.cm })
                    .text({ textAlign: 'center', fontSize: 7 }).add(tempScore+'%')
    
                    if(result)
                        doc.cell({ width: 1.25*pdf.cm, x: 25.5*pdf.cm, y: yAnchor - 0.6*pdf.cm })
                        .text({ textAlign: 'center', fontSize: 7 }).add(tempScore+'%') // Result
                }
            }
        
            try {
                // --------------------------- Page 1 --------------------------- //
                doc.setTemplate(ext_1) 
                doc.cell({ width: 8*pdf.cm, x: 2*pdf.cm, y: 17.25*pdf.cm }) // Name
                .text({ textAlign: 'center', fontSize: 7 }).add(data.first_name+' '+data.last_name)
                
                doc.cell({ width: 3.2*pdf.cm, x: 11.4*pdf.cm, y: 17.25*pdf.cm }) // Position
                .text({ textAlign: 'center', fontSize: 7 }).add(data.area)
                
                doc.cell({ width: 2*pdf.cm, x: 18.5*pdf.cm, y: 17.25*pdf.cm }) // Employee number
                .text({ textAlign: 'center', fontSize: 7 }).add(data._id)
                
                doc.cell({ width: 2.5*pdf.cm, x: 22.25*pdf.cm, y: 17.15*pdf.cm }) // Date
                .text({ textAlign: 'center', fontSize: 7 }).add(dateFormated)
                
                doc.cell({ width: 7.5*pdf.cm, x: 2.5*pdf.cm, y: 16.45*pdf.cm }) // Department
                .text({ textAlign: 'center', fontSize: 7 }).add(data.area)
                
                doc.cell({ width: 4.3*pdf.cm, x: 11.3*pdf.cm, y: 16.45*pdf.cm }) // Category
                .text({ textAlign: 'center', fontSize: 7 }).add(data.contract)
                
                yAnchor = 13.5*pdf.cm + 2*pdf.cm
                xAnchor = 13.1*pdf.cm

                printAnswers(1, 2.03, true)
                printAnswers(2, 2.03, true)
                printAnswers(3, 2.03, true)
                printAnswers(4, 2.03, true)

                // --------------------------- Page 1 --------------------------- //
                doc.cell({ width: 2.5*pdf.cm, x: 22.25*pdf.cm, y: 17.15*pdf.cm }) // Date
                .text({ textAlign: 'center', fontSize: 7 }).add(dateFormated)

                // --------------------------- Page 1 --------------------------- //
                
                // --------------------------- Page 2 --------------------------- //
                doc.setTemplate(ext_2)
                
                // --------------------------- Page 2 --------------------------- //
                
                // --------------------------- Page 3 --------------------------- //
                doc.setTemplate(ext_3)
                
                // --------------------------- Page 3 --------------------------- //
            } catch (error) {
                console.error(error)
                await doc.end() // Close file
                return res.end(null)
            }

            res.setHeader("Content-Disposition", "attachment; output.pdf")
            await doc.pipe(res)
            await doc.end() // Close file
        } else {
            console.error('No data')
            return res.end(JSON.stringify({
                status: 404,
                error: 'No data'
            }))
        }
    })
    .catch(error => {
        console.error(error)
        return res.end(JSON.stringify({
            status: 500,
            error: error
        }))
    })

    /**
     * TODO:
     * Made promise for the above code and get the data
     * Print the data in the sheet
     * Get each result of the survey and store it in the data base 
     */
}

module.exports = {
    root,
    pdfEvalFormat
}