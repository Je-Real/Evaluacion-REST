const pdf = require('pdfjs')
const fs = require('fs')
const path = require('path')

const modelUserInfo = require('../models/modelUserInfo')
const DATE = new Date()

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
    return res.status(200).render('ctrl_table', {
        title_page: 'UTNA - Inicio',
        session: session,
        records: records
    })
}

async function pdfEvalFormat(req, res) {
    const userID = req.params.id

    modelUserInfo.aggregate([
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

    /**
     * TODO:
     * Made promise for the above code and get the data
     * Print the data in the sheet
     * Get each result of the survey and store it in the data base 
     */

    const doc = new pdf.Document({
        width:   792,
        height:  612
    })
    const ext_1 = new pdf.ExternalDocument(
        fs.readFileSync(path.join(__dirname, '../assets/templates/Formato-de-Evaluacion-1.pdf'))
    )

    /*src = fs.readFileSync(path.join(__dirname, '../assets/templates/Formato-de-Evaluacion-3.pdf'))
    const ext_3 = new pdf.ExternalDocument(src)*/

    let date_time = new Date(Date.now()),
        dateFormated = date_time.getDate()+'/'+(date_time.getMonth()+1)+'/'+date_time.getFullYear()

    try {
        //doc.pipe(fs.createWriteStream(path.join(__dirname, '../exports/eval-format-output.pdf'))) // Open output file
        
        doc.setTemplate(ext_1)

        doc.cell({ width: 0.3*pdf.cm, x: 22.7*pdf.cm, y: 18.98*pdf.cm }) // Current page
            .text({ fontSize: 8 }).add('1')

        doc.cell({ width: 5.5*pdf.cm, x: 3.75*pdf.cm, y: 17.5*pdf.cm }) // Name
            .text({ textAlign: 'center', fontSize: 8 }).add('Jeremy Oswald Richarte Bernal')
        
        doc.cell({ width: 4.3*pdf.cm, x: 11.3*pdf.cm, y: 17.5*pdf.cm }) // Position
            .text({ textAlign: 'center', fontSize: 8 }).add('prueba')
        
        doc.cell({ width: 2*pdf.cm, x: 19.5*pdf.cm, y: 17.5*pdf.cm }) // Employee number
            .text({ textAlign: 'center', fontSize: 8 }).add('143')
        
        doc.cell({ width: 4.3*pdf.cm, x: 22.8*pdf.cm, y: 17.5*pdf.cm }) // Date
            .text({ textAlign: 'center', fontSize: 8 }).add(dateFormated)
        
        doc.cell({ width: 5*pdf.cm, x: 4.3*pdf.cm, y: 16.6*pdf.cm }) // Department
            .text({ textAlign: 'center', fontSize: 8 }).add('Dirección Académica de Administración y Contaduría')
        
        doc.cell({ width: 4.3*pdf.cm, x: 11.3*pdf.cm, y: 16.55*pdf.cm }) // Category
            .text({ textAlign: 'center', fontSize: 8 }).add('Confianza')
        
        doc.cell({ width: 2*pdf.cm, x: 20.8*pdf.cm, y: 16.55*pdf.cm }) // Average
            .text({ textAlign: 'center', fontSize: 8 }).add('999.0%')
        

        res.setHeader("Content-Disposition", "attachment; output.pdf")
        await doc.pipe(res)
        await doc.end() // Close file
            /*.then(() => {
                //const rs = fs.createReadStream(path.join(__dirname, '../exports/eval-format-output.pdf'))
                res.setHeader("Content-Disposition", "attachment; output.pdf")
                doc.pipe(res)
            })*/
    } catch (error) {
        console.error(error)
        return res.end(JSON.stringify({
            status: 500,
            error: error
        }))
    }
}

module.exports = {
    root,
    pdfEvalFormat
}