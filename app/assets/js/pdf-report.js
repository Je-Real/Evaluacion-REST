const { jsPDF } = window.jspdf
const doc = new jsPDF()

var d = new Date().toLocaleDateString('es')

async function pdfReport() {
    const w = 210
    const h = 297
    var spacing = 0,
        canvas, canvasImg,
        img = new Image()
    
    img.src = '../img/logo-utna-c.png'

    doc.setFontSize(11)
    doc.text(w*0.1, h*0.05, 'Usuario: '+user)
    doc.text(w*0.775, h*0.05, d)
    doc.addImage(await img, 'PNG', w*0.4, h*0.01, 40, 20)

    doc.setLineWidth(3)
    doc.setDrawColor(200, 200, 200) //Background line
    doc.line(w*0, h*0.079, w*0.3, h*0.079)
    doc.setLineWidth(1)
    doc.setDrawColor(150, 150, 150) //Front line
    doc.line(w*0, h*0.085, w*0.5, h*0.085)

    doc.setFontSize(25)
    doc.text(w*0.09, h*0.13, 'Reporte')

    if(lvl <= 4){
        canvas = document.getElementById('doughnutChart')
        canvasImg = canvas.toDataURL()
        spacing = h*0.25 + h*0.05
        doc.addImage(canvasImg, 'PNG', w*0.3, h*0.15, 80, 80)
    }
    
    canvas = document.getElementById('barChart')
    canvasImg = canvas.toDataURL()
    doc.addImage(canvasImg, 'PNG', w*0.1, spacing+h*0.15, 80, 70)
    
    canvas = document.getElementById('lineChart')
    canvasImg = canvas.toDataURL()
    doc.addImage(canvasImg, 'PNG', w*0.5, spacing+h*0.15, 80, 70)
    
    await doc.save('reporte_'+user+'-'+d+'.pdf')
}