const { jsPDF } = window.jspdf

const docV = new jsPDF() // Vertical, unit millimeter, a4
const docH = new jsPDF({ // Horizontal, unit millimeter, a4
	orientation: "landscape"
})

const dateLocal = new Date().toLocaleDateString('es')
const _w = 210 // Total mm width in sheet
const _h = 297 // Total mm height in sheet

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
		let yAnchor

		$e('#btn-personnel-eval-format').addEventListener('click', async(e) => {
			try {
				// --- Table Structure [Page 1] --- //
				docH.setLineWidth(0.35) // Line width
				docH.setDrawColor(0, 0, 0) // Color

				yAnchor = _w*0.0975

				// ------------ Header ------------ //
				docH.line(_h*0.0405, yAnchor, _h*0.9595, yAnchor) // Top line
				docH.line(_h*0.0405, yAnchor, _h*0.0405, yAnchor + _w*0.093) // Left line
				docH.line(_h*0.9595, yAnchor, _h*0.9595, yAnchor + _w*0.093) // Right line
				docH.line(_h*0.0405, yAnchor + _w*0.093, _h*0.9595, yAnchor + _w*0.093) // Bottom line
				
				docH.line(_h*0.0405 + 50, yAnchor, _h*0.0405 + 50, yAnchor + _w*0.093) // col 1
				docH.line(_h*0.9595 - 50, yAnchor, _h*0.9595 - 50, yAnchor + _w*0.093) // col 3

				docH.line(_h*0.9595 - 50, yAnchor + _w*0.02325, _h*0.9595, yAnchor + _w*0.02325) // 1/4 row
				docH.line(_h*0.0405 + 50, yAnchor + _w*0.0465, _h*0.9595, yAnchor + _w*0.0465) // 1/2 row
				docH.line(_h*0.9595 - 50, yAnchor + _w*(0.0465 + 0.02325), _h*0.9595, yAnchor + _w*(0.0465 + 0.02325)) // 3/4 row

				yAnchor += _w*0.093 + _w*0.025

				// ------------- Body ------------ //
				docH.line(_h*0.0405, yAnchor, _h*0.0405, _w*0.845) // Left line
				docH.line(_h*0.0405, yAnchor, _h*0.9595, yAnchor) // Top line
				docH.line(_h*0.9595, yAnchor, _h*0.9595, _w*0.845) // Right line
				docH.line(_h*0.0405, _w*0.845, _h*0.9595, _w*0.845) // Bottom line
	
				//await docH.addImage( img, 'PNG', w*0.4, h*0.0325, 40, 20) // Set logo
				
				// ---- Body ---- //
	
				await docH.save('formato_evaluacion_'+'GET_NAME'.replace(' ', '_')+'-'+dateLocal+'.pdf')
			} catch (error) {
				showSnack('An error occurred while assigning event to PDF Generator', 'PDF-Generator', SNACK.error)
				console.error(error)
			}
		})
	}
})
