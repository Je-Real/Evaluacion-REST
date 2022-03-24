const crypto = require('crypto-js')
const path = require('path')
const fs = require('fs')

const XLSXPopulate = require('xlsx-populate')

// >>>>>>>>>>>>>>>>>>>>>> Control <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
	return res.status(200).render('secret/test', {
		title_page: 'UTNA - Test',
		session: {
			_id: "0",
			name: "test",
			area: 0,
			direction: 0,
			position: 0,
			category: 0,
		}
	})
}

async function saveAsExcel(req, res) {
	
	const excel = async() => {
		const getSheetData = (data, header) => {
			let fields = Object.keys(data[0])
			let sheetData = data.map((row) => {
				return fields.map((fieldName) => {
					return (String(row[fieldName]).length != 0) ? row[fieldName] : ''
				})
			})
			sheetData.unshift(header)
			return sheetData
		}
		
		data = [{
			"_id": 1,
			"name": "María Angélica Martínez Díaz",
			"category": 1,
			"area": 1,
			"direction": 0,
			"position": 0,
			"manager": false
		},
		{
			"_id": 2,
			"name": "Angelica Zavala Martínez",
			"category": 2,
			"area": 1,
			"manager": 0
		},
		{
			"_id": 3,
			"name": "Alfredo Cárdenas",
			"category": 2,
			"area": 1,
			"manager": 0
		}]
		let header = ["_id", "name", "category", "area", "direction", "position", "manager"]
	
		return await XLSXPopulate.fromBlankAsync().then(async (workbook) => {
			const sheet1 = workbook.sheet(0)
			const sheetData = getSheetData(data, header)
			const totalColumns = sheetData[0].length
	
			sheet1.cell("A1").value(sheetData)
			const range = sheet1.usedRange()
			const endColumn = String.fromCharCode(64 + totalColumns)
			sheet1.row(1).style("bold", true)
			sheet1.range("A1:" + endColumn + "1").style("fill", "BFBFBF")
			range.style("border", true)
			return await workbook.outputAsync()
				.catch(error => console.error(error))
		})
	}

	return res.send(await excel())
}

module.exports = {
	root,
	saveAsExcel,
}