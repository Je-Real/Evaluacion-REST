const { jsPDF } = window.jspdf
const doc = new jsPDF()

try {
    document.getElementById('pdfGenerate').addEventListener('click', async() => {
        const w = 210 // Total width in sheet
        const h = 297 // Total height in sheet
        let dateLocal = new Date().toLocaleDateString('es'),
            firstName = document.getElementById('input_first_name').value,
            lastName = document.getElementById('input_last_name').value,
			lienzos = document.querySelectorAll('.lienzos'), 
			lienzosLength = document.querySelectorAll('.lienzos .ghost-container:not(.d-block)').length,
            spacing = 0, bodyMS = w*0.105, bodyMT = h*0.16,
            img = new Image(), index = 0,
			columnSwitch, canvasImg, canvasGetter
        
        img.src = '../img/logo-utna-c.png' // Get logo resource
    
        // --- Header --- //
        doc.setFontSize(11) // Set small font size
        doc.text(w*0.1, h*0.061, firstName) // Set first name
        doc.text(w*0.1, h*0.076, lastName) // Set last name
        doc.text(w*0.775, h*0.074, dateLocal) // Set date
        await doc.addImage( img, 'PNG', w*0.4, h*0.0325, 40, 20) // Set logo
    
        doc.setLineWidth(3)
        doc.setDrawColor(200, 200, 200) // Background line color
        doc.line(w*0, h*0.113, w*0.3, h*0.113) // Background line
        doc.setLineWidth(1)
        doc.setDrawColor(150, 150, 150) // Front line color
        doc.line(w*0, h*0.119, w*0.5, h*0.119) // Front line
        // --- Header --- //
        
        // ---- Body ---- //
        doc.setFontSize(25) // Set normal font size
        doc.text(bodyMS, bodyMT, 'Reporte')

        Array.prototype.forEach.call( lienzos, (node) => {
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

			if (node.querySelector('.ghost-container').classList.contains('d-none')) {
				index++ // Manual index, first loop is 1
				spacing = (index <= 2) ? h*0.21 : h*0.57 // Spacing below semi doughnut
				/* Check whether is posible to enter the next loop
				 * else then center the canvas group */
				if (index+1 <= lienzosLength || index === 2 || index === 4) { 
					/* If the current index is divisible by 2 then the canvas group
					 * will be placed in the second column
					 * else, the canvas group will be placed in the first column */
					if (index % 2 === 0) columnSwitch = w*0.5
					else columnSwitch = w*0.1
				} else columnSwitch = w*0.3
	
				/*log(
					'Indexes: '+lienzosLength+
					' - Loop: '+index+
					' - Next loop: '+(index+1 <= lienzosLength || index === 2 || index === 4)+
					' - Divisible?: '+(index % 2 === 0)+
					' - Margin: '+columnSwitch,
					style.cian
				)*/
	
				doc.setFontSize(12)
				doc.text(columnSwitch+w*0.025, spacing,
					node.querySelector('.canvasTitle').innerHTML.trim()) // Set title
	
				// Canvas - semi doughnut chart
				canvasGetter = node.querySelector('.semiDoughnutChart canvas')
				canvasImg = canvasGetter.toDataURL()
				doc.addImage(canvasImg, 'PNG', columnSwitch, spacing+h*0.011, 80, 42)
				doc.setFontSize(16)
				doc.text(columnSwitch+w*0.16, spacing+h*0.112,
					node.querySelector('.semiDoughnutChart span').innerHTML) // Set percentage
	
				// Canvas - bars chart
				canvasGetter = node.querySelector('.barsChart canvas')
				canvasImg = canvasGetter.toDataURL()
				doc.addImage(canvasImg, 'PNG', columnSwitch, spacing+h*0.15, 80, 45)
	
				// Canvas - line chart
				// canvas = node.getElementById('lineChart')
				// canvasImg = canvas.toDataURL()
				// doc.addImage(canvasImg, 'PNG', w*0.5, spacing+h*0.15, 80, 70)
			} else {
				log(`[PDF-Generator] Skipping empty panel(s)`, style.warning)
			}
		})
        // ---- Body ---- //
        
        await doc.save('reporte_'+firstName.replace(' ', '_')+'-'+dateLocal+'.pdf')
    })
} catch (error) {
    log('[PDF-Generator] An error occurred while assigning event to PDF Generator', style.error)
    console.error(error)
}