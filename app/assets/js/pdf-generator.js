const { jsPDF } = window.jspdf

const docV = new jsPDF({ // Vertical, unit millimeter, letter
	format: 'letter',
})
const docH = new jsPDF({ // Horizontal, unit millimeter, letter
	format: 'letter',
	orientation: "landscape"
})

const dateLocal = new Date().toLocaleDateString('es')
const _w = 215.9 // Total mm width in sheet
const _h = 279.4 // Total mm height in sheet

let img = new Image()

window.addEventListener('load', async(e) => {
	img.src = '../img/logo-utna-c.png' // Get logo resource

	if($e('#btn-pdf-report') != undefined) {

		try {
			$e('#btn-pdf-report').addEventListener('click', async() => {
				let firstName = $e('#input_first_name').value,
					lastName = $e('#input_last_name').value,
					lienzosLength = $a('.lienzos .ghost-container:not(.d-block)').length,
					spacing = 0, bodyMS = _w*0.105, bodyMT = _h*0.16, index = 0,
					columnSwitch, canvasImg, canvasGetter
			
				// --- Header --- //
				docV.setFontSize(11) // Set small font size
				docV.text(_w*0.1, _h*0.061, firstName) // Set first name
				docV.text(_w*0.1, _h*0.076, lastName) // Set last name
				docV.text(_w*0.775, _h*0.074, dateLocal) // Set date
				await docV.addImage( img, 'PNG', _w*0.4, _h*0.0325, 40, 20) // Set logo
			
				docV.setLineWidth(3)
				docV.setDrawColor(200, 200, 200) // Background line color
				docV.line(_w*0, _h*0.113, _w*0.3, _h*0.113) // Background line
				docV.setLineWidth(1)
				docV.setDrawColor(150, 150, 150) // Front line color
				docV.line(_w*0, _h*0.119, _w*0.5, _h*0.119) // Front line
				// --- Header --- //
				
				// ---- Body ---- //
				docV.setFontSize(25) // Set normal font size
				docV.text(bodyMS, bodyMT, 'Reporte')
	
				$a('.lienzos').forEach(node => {
					/**
					 * If there are more than 1 canvas group in a page
					 * the page will divide in 2 columns
					 *  > First column margin = w * 0.1
					 *  > Second column margin = w * 0.5
					 * 
					 * Else if there is only one canvas group the column
					 * will be centered in the middle of the page
					 *  > Unique column margin = w * 0.3
					 */
	
					if(node.querySelector('.ghost-container').classList.contains('d-none')) {
						index++ // Manual index, first loop is 1
						spacing = (index <= 2) ? _h*0.21 : _h*0.57 // Spacing below semi doughnut
						/* Check whether is posible to enter the next loop
						* else then center the canvas group */
						if(index+1 <= lienzosLength || index === 2 || index === 4) { 
							/* If the current index is divisible by 2 then the canvas group
							* will be placed in the second column
							* else, the canvas group will be placed in the first column */
							if(index % 2 === 0) columnSwitch = _w*0.5
							else columnSwitch = _w*0.1
						} else columnSwitch = _w*0.3
			
						/*log(
							'Indexes: '+lienzosLength+
							' - Loop: '+index+
							' - Next loop: '+(index+1 <= lienzosLength || index === 2 || index === 4)+
							' - Divisible?: '+(index % 2 === 0)+
							' - Margin: '+columnSwitch,
							STYLE.cian
						)*/
			
						docV.setFontSize(12)
						docV.text(columnSwitch+_w*0.025, spacing,
							node.querySelector('.canvasTitle').innerHTML.trim()) // Set title
			
						// Canvas - semi doughnut chart
						canvasGetter = node.querySelector('.semiDoughnutChart canvas')
						canvasImg = canvasGetter.toDataURL()
						docV.addImage(canvasImg, 'PNG', columnSwitch, spacing+_h*0.011, 80, 42)
						docV.setFontSize(16)
						docV.text(columnSwitch+_w*0.16, spacing+_h*0.112,
							node.querySelector('.semiDoughnutChart span').innerHTML) // Set percentage
			
						// Canvas - bars chart
						canvasGetter = node.querySelector('.barsChart canvas')
						canvasImg = canvasGetter.toDataURL()
						docV.addImage(canvasImg, 'PNG', columnSwitch, spacing+_h*0.15, 80, 45)
			
						// Canvas - line chart
						// canvas = node.getElementById('lineChart')
						// canvasImg = canvas.toDataURL()
						// doc.addImage(canvasImg, 'PNG', w*0.5, spacing+h*0.15, 80, 70)
					} else {
						log(`[PDF-Generator] Skipping empty panel(s)`, STYLE.warning)
					}
				})
				// ---- Body ---- //
				
				await docV.save('reporte_'+firstName.replace(' ', '_')+'-'+dateLocal+'.pdf')
			})
		} catch (error) {
			showSnack('An error occurred while assigning event to PDF Generator', 'PDF-Generator', SNACK.error)
			console.error(error)
		}
	}

	if($e('#btn-personnel-eval-format') != undefined) {
		const rowWidth = _h*(0.9595 - 0.0405) // Row relative total width 272.943
		const _rW = (percentage) => ((percentage * rowWidth) / 100) + _h*0.0405
		let src, ext

		let yAnchor

		$e('#btn-personnel-eval-format').addEventListener('click', async(e) => {
			AJAJ(
				'http://localhost:999/inicio/evaluation-pdf',
				'GET',
				null,
				(result) => showSnack(result.msg, 'PDF', SNACK.success),
				(err) => console.error(err) 
			)

			/*try {
				// --- Table Structure [Page 1] --- //
				docH.setLineWidth(0.35) // Line width
				docH.setDrawColor(0, 0, 0) // Color

				// ------------ Header ------------ //
				yAnchor = _w*0.0975 // 20.475 mm
				docH.line(_rW(0), yAnchor, _rW(100), yAnchor) // Top line
				docH.line(_rW(0), yAnchor, _rW(0), yAnchor + _w*0.093) // Left line
				docH.line(_rW(100), yAnchor, _rW(100), yAnchor + _w*0.093) // Right line
				docH.line(_rW(0), yAnchor + _w*0.093, _rW(100), yAnchor + _w*0.093) // Bottom line
				
				docH.line(_rW(0) + 50, yAnchor, _rW(0) + 50, yAnchor + _w*0.093) // 1st - 2nd col
				docH.line(_rW(100) - 50, yAnchor, _rW(100) - 50, yAnchor + _w*0.093) // 2nd - 3rd col
				
				await docH.addImage(img, 'PNG', _rW(0) + 5, yAnchor + 1.5, 41, 16.5) // Set logo
				
				docH.line(_rW(100) - 50, yAnchor + _w*0.02325, _rW(100), yAnchor + _w*0.02325) // 1/4 rows
				docH.line(_rW(0) + 50, yAnchor + _w*0.0465, _rW(100), yAnchor + _w*0.0465) // 2/4 rows
				docH.line(_rW(100) - 50, yAnchor + _w*(0.0465 + 0.02325), _rW(100), yAnchor + _w*(0.0465 + 0.02325)) // 3/4 rows
				
				docH.setFontSize(10)
				docH.text(94, 27.3, 'UNIVERSIDAD TECNOLÓGICA DEL NORTE DE AGUASCALIENTES')
				docH.text(93, (yAnchor + _w*0.093) - 4.2, 'FORMATO PARA LA EVALUACIÓN AL DESEMPEÑO DEL PERSONAL')
				
				docH.setFontSize(8)
				docH.text(_rW(100) - 49.5, yAnchor + 3.5, 	'REVISIÓN: 3')
				docH.text(_rW(100) - 49.5, yAnchor + 8.5, 	'CÓDIGO: FM-EDP-01/01')
				docH.text(_rW(100) - 49.5, yAnchor + 13.25, 'REF. NORMATIVA: 6.2')
				docH.text(_rW(100) - 49.5, yAnchor + 17.8, 	'HOJA 1 DE 3')

				// ------------- Body ------------ //
				yAnchor += _w*0.093 + _w*0.025 // 45.255 mm
				docH.line(_rW(0), yAnchor, _rW(0), _w*0.845) // Left line
				docH.line(_rW(0), yAnchor, _rW(100), yAnchor) // Top line
				docH.line(_rW(100), yAnchor, _rW(100), _w*0.845) // Right line
				docH.line(_rW(0), _w*0.845, _rW(100), _w*0.845) // Bottom line
				
				docH.line(_rW(0), yAnchor += 9, _rW(100), yAnchor) // 1st row
				docH.line(_rW(37.5), yAnchor, _rW(37.5), yAnchor - 9) // 1st - 2nd col
				docH.line(_rW(59.5), yAnchor, _rW(59.5), yAnchor - 9) // 2nd - 3rd col
				docH.line(_rW(100) - 50, yAnchor, _rW(100) - 50, yAnchor - 9) // 3rd - 4th col
				
				docH.line(_rW(0), yAnchor += 9, _rW(100), yAnchor) // 2nd row
				docH.line(_rW(37.5), yAnchor, _rW(37.5), yAnchor - 9) // 1st - 2nd col
				docH.line(_rW(59.5), yAnchor, _rW(59.5), yAnchor - 9) // 2nd - 3rd col
				
				docH.line(_rW(0), yAnchor += 11, _rW(100), yAnchor) // 3rd row
				
				docH.line(_rW(0), yAnchor += 11, _rW(100), yAnchor) // 3rd row
				
				docH.line(_rW(0), yAnchor += 4, _rW(100), yAnchor) // 4th row
				docH.line(_rW(45), yAnchor - 4, _rW(45), _w*0.845) // Validation factors & Standards / category for performance evaluation col
				docH.line(_rW(90), yAnchor - 4, _rW(90), _w*0.845) // Results col
				
				docH.line(_rW(20), yAnchor, _rW(20), _w*0.845) // 1st - 2nd col
				docH.line(_rW(56.25), yAnchor, _rW(56.25), _w*0.845) // 2nd - 3rd col
				docH.line(_rW(67.5), yAnchor, _rW(67.5), _w*0.845) // 3rd - 4th col
				docH.line(_rW(78.75), yAnchor, _rW(78.75), _w*0.845) // 4th - 5th col

				docH.line(_rW(0), yAnchor += 22, _rW(100), yAnchor) // 5th row
				docH.line(_rW(45), yAnchor - 17, _rW(90), yAnchor - 17) // 5th row - top
				docH.line(_rW(45), yAnchor - 5, _rW(90), yAnchor - 5) // 5th row - bottom
				
				docH.line(_rW(0), yAnchor += 22, _rW(100), yAnchor) // 6th row
				docH.line(_rW(45), yAnchor - 17, _rW(90), yAnchor - 17) // 5th row - top
				docH.line(_rW(45), yAnchor - 5, _rW(90), yAnchor - 5) // 5th row - bottom
				
				docH.line(_rW(0), yAnchor += 22, _rW(100), yAnchor) // 7th row
				docH.line(_rW(45), yAnchor - 17, _rW(90), yAnchor - 17) // 5th row - top
				docH.line(_rW(45), yAnchor - 5, _rW(90), yAnchor - 5) // 5th row - bottom
				yAnchor += 22
				docH.line(_rW(45), yAnchor - 17, _rW(90), yAnchor - 17) // 5th row - top
				docH.line(_rW(45), _w*0.845 - 5, _rW(90), _w*0.845 - 5) // 5th row - bottom

				// ---- Body ---- //
	
				await docH.save('formato_evaluacion_'+'GET_NAME'.replace(' ', '_')+'-'+dateLocal+'.pdf')
			} catch (error) {
				showSnack('An error occurred while assigning event to PDF Generator', 'PDF-Generator', SNACK.error)
				console.error(error)
			}*/
		})
	}
})
