letconst bgColorDefault = [
	"rgba(255, 99, 132, 0.65)",
	"rgba(54, 162, 235, 0.65)",
	"rgba(255, 206, 86, 0.65)",
	"rgba(75, 192, 192, 0.65)",
	"rgba(153, 102, 255, 0.65)",
]
const fgColorDefault = [
	"rgba(255, 99, 132, 1)",
	"rgba(54, 162, 235, 1)",
	"rgba(255, 206, 86, 1)",
	"rgba(75, 192, 192, 1)",
	"rgba(153, 102, 255, 1)",
]

var canvas, width, height, gradient,
	dChart, bChart, lChart

function getGradient(ctx, chartArea) {
	const chartWidth = chartArea.right - chartArea.left
	const chartHeight = chartArea.bottom - chartArea.top
	if (gradient === null || width !== chartWidth || height !== chartHeight) {
		// Create the gradient because this is either the first render
		// or the size of the chart has changed
		width = chartWidth
		height = chartHeight
		gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
		gradient.addColorStop(0, "#ED859A")
		gradient.addColorStop(0.5, "#FFD452")
		gradient.addColorStop(1, "#84ECB6")
	}

	return gradient
}

function semiDoughnutChart(data, id, colors) {
	if (data > 0 && data <= 100) {
		id = (id == undefined) ? 'semiDoughnutChart-0' : id

		if (dChart != undefined)
			dChart.destroy()

		canvas = document.getElementById(id)

		var ctx = canvas.getContext('2d');
		dChart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels: ['total', 'empty'],
				datasets: [{
					label: 'Promedio Total',
					data: [data, (100-data)],
					backgroundColor: [
						'rgb(99, 255, 132)',
						'rgb(230, 230, 230)',
					],
					circumference: 180,
					rotation: 270,
					hoverOffset: 4,
					cutout: '70%',
				},]
			},
			options: {
				aspectRatio: 2,
				plugins: {
					tooltip: {
						enabled: false,
					},
					legend: {
						display: false
					},
					title: {
						display: true,
						text: 'Promedio Total'
					}
				},
			}
		})

		var newSpan = document.createElement('span')
		newSpan.innerHTML = data+'%'
		canvas.parentNode.insertBefore(newSpan, canvas.nextSibling)
		
		return console.log("Loaded semi doughnut!")
	}
	console.warn("Semi doughnut without data")
}

function barChart(labels, data, id, colors) {
	if (labels.length && data.length) {
		var bgColor, fgColor

		if (bChart != undefined)
			bChart.destroy()
		
		bgColor = (colors != undefined && colors.length == 5) ? colors : bgColorDefault
		fgColor = (colors != undefined && colors.length == 5) ? colors : fgColorDefault
		id = (id == undefined) ? 'barsChart-0' : id
		
		var ctx = document.getElementById(id).getContext("2d")
		bChart = new Chart(ctx, {
			type: "bar",
			data: {
				labels: labels, //Years labels
				datasets: [{
					label: "Puntuación",
					data: data, //Records' data
					backgroundColor: bgColor,
					borderColor: fgColor,
					borderWidth: 2,
				}],
			},
			plugins: [ChartDataLabels],
			options: {
				legend: {
					display: false,
					labels: {
						fontSize: 20,
						fontColor: '#595d6e',
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						min: 0,
						max: 100
					}
				},
				plugins: {
					tooltip: {
						enabled: false
					},
					datalabels: {
						formatter: (value, ctx) => {
							return ctx.chart.data.datasets[0].data[ctx.dataIndex]+'%'
						},
						color: '#fff',
						backgroundColor: '#404040',
						padding: {
							top: 3,
							right: 5,
							bottom: 1,
							left: 5
						},
					}
				}
			}
		})

		return console.log("Loaded bars!")
	}
	console.warn("Bars without data")
}

function lineChart(labels, data, colors) {
	if (labels.length && data.length) {
		if (lChart != undefined)
			lChart.destroy()

		ctx = document.getElementById("lineChart").getContext("2d")
		lChart = new Chart(ctx, {
			type: "line",
			data: {
				labels: labels, //Years labels
				datasets: [
					{
						label: "Puntuación",
						data: data, //Records' data
						cubicInterpolationMode: "monotone",
						fill: false,
						tension: 0.4,
						borderColor: (context) => {
							const chart = context.chart
							const { ctx, chartArea } = chart

							if (!chartArea) {
								// This case happens on initial chart load
								return null
							}
							return getGradient(ctx, chartArea)
						},
						borderWidth: 3,
					},
				],
			},
			options: {
				scales: {
					y: {
						beginAtZero: true,
					},
				},
				interaction: {
					mode: "nearest",
					axis: "x",
					intersect: false,
				},
			},
		})
		return console.log("Loaded line!")
	}
	console.warn("Line without data")
}
