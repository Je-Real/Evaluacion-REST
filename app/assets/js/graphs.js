const bgColorDefault = [
	'rgba(255, 99, 132, 0.65)',
	'rgba(54, 162, 235, 0.65)',
	'rgba(255, 206, 86, 0.65)',
	'rgba(75, 192, 192, 0.65)',
	'rgba(153, 102, 255, 0.65)',
]
const fgColorDefault = [
	'rgba(255, 99, 132, 1)',
	'rgba(54, 162, 235, 1)',
	'rgba(255, 206, 86, 1)',
	'rgba(75, 192, 192, 1)',
	'rgba(153, 102, 255, 1)',
]

let canvas, width, height, gradient,
	dChart = [], bChart = [], lChart = []

function getGradient(ctx, chartArea) {
	const chartWidth = chartArea.right - chartArea.left
	const chartHeight = chartArea.bottom - chartArea.top
	if(gradient === null || width != chartWidth || height != chartHeight) {
		// Create the gradient because this is either the first render
		// or the size of the chart has changed
		width = chartWidth
		height = chartHeight
		gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
		gradient.addColorStop(0, '#ED859A')
		gradient.addColorStop(0.5, '#FFD452')
		gradient.addColorStop(1, '#84ECB6')
	}

	return gradient
}

function semiDoughnutChart(id, data, colors) {
	if((data > 0 && data <= 100)) {
		if(dChart[id] != undefined) dChart[id].destroy()
		let span

		try {
			canvas = $e(`.panel[data-id="${id}"] .semiDoughnutChart canvas`)
			let ctx = canvas.getContext('2d')
			dChart[id] = new Chart(ctx, {
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

			if(canvas.nextElementSibling.nodeName === 'SPAN') {
				span = canvas.nextElementSibling
			} else {
				span = document.createElement('span')
				canvas.parentNode.insertBefore(span, canvas.nextSibling)
			}
			
			span.innerHTML = data+'%'
			canvas = null
			
			log('[Graphs] Loaded Semi doughnut!', STYLE.success)
			return true
		} catch (error) {
			log('[Graphs] Error in Semi doughnut', STYLE.error)
			console.error(error)
			return false
		}
	} else if (data === null) {
		console.warn('[Graphs] Semi doughnut without data')
		return null
	}
	log('[Graphs] Error in Semi doughnut', STYLE.error)
	console.error(id)
	console.error(data)
}

function barChart(id, labels, data, colors) {
	if(labels.length && data.length) {
		if(bChart[id] != undefined) bChart[id].destroy()
		let bgColor, fgColor
		
		bgColor = (colors != undefined && colors.length == 5) ? colors : bgColorDefault
		fgColor = (colors != undefined && colors.length == 5) ? colors : fgColorDefault
		
		try {
			canvas = $e(id)
			let ctx = canvas.getContext('2d')
			bChart[id] = new Chart(ctx, {
				type: 'bar',
				data: {
					labels: labels, //Years labels
					datasets: [{
						label: 'Puntuación',
						data: data, //Records' data
						backgroundColor: bgColor,
						borderColor: fgColor,
						borderWidth: 2,
					}],
				},
				plugins: [ChartDataLabels],
				options: {
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
						legend: {
							display: false
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
			canvas = null
			return log('[Graphs] Loaded Bars!', STYLE.success)
		} catch (error) {
			log('[Graphs] Error in Bars', STYLE.error)
			return console.error(error)
		}
	}
	console.warn('[Graphs] Bars without data')
}

function lineChart(id, labels, data, colors) {
	if(labels.length && data.length) {
		if(lChart[id] != undefined) lChart[id].destroy()

		try {
			canvas = $e(`.panel[data-id="${id}"] .barsChart canvas`)
			let ctx = canvas.getContext('2d')
			lChart[id] = new Chart(ctx, {
				type: 'line',
				data: {
					labels: labels, //Years labels
					datasets: [
						{
							label: 'Puntuación',
							data: data, //Records' data
							cubicInterpolationMode: 'monotone',
							fill: false,
							tension: 0.4,
							borderColor: (context) => {
								const chart = context.chart
								const { ctx, chartArea } = chart

								if(!chartArea) {
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
							min: 0,
							max: 100,
							ticks: {
								stepSize: 20
							}
						}
					},
					plugins: {
						legend: {
							display: false
						},
						tooltip: {
							enabled: false
						}
					}
				},
			})
			canvas = null
			log('[Graphs] Loaded line!', STYLE.success)
			return true
		} catch (error) {
			log('[Graphs] Error in line graph', STYLE.error)
			console.error(error)
			return false
		}
	}
	log('[Graphs] Line without data', STYLE.warning)
	return null
}
