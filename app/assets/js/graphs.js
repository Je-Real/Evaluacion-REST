const bgColor = [ 
    "rgba(255, 99, 132, 0.65)",
    "rgba(54, 162, 235, 0.65)",
    "rgba(255, 206, 86, 0.65)",
    "rgba(75, 192, 192, 0.65)",
    "rgba(153, 102, 255, 0.65)",
]
const brColor = [
    "rgba(255, 99, 132, 1)",
    "rgba(54, 162, 235, 1)",
    "rgba(255, 206, 86, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(153, 102, 255, 1)"
]

function doughnutChart(labels, data, colors) {
    if (labels.length && data.length) {
        var ctx = document.getElementById("doughnutChart").getContext("2d")
        var doughnutChart = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: labels, //Years labels
                datasets: [
                    {
                        label: "Puntuación",
                        data: data, //Records' data
                        backgroundColor: bgColor,
                        borderColor: brColor,
                        borderWidth: 2,
                    },
                ],
            }
        })
        console.log('Loaded doughnut!')
    }
}

function barChart(labels, data, colors) {
    if (labels.length && data.length) {
        var ctx = document.getElementById("barChart").getContext("2d")
        var barChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels, //Years labels
                datasets: [
                    {
                        label: 'Puntuación',
                        data: data, //Records' data
                        backgroundColor: bgColor,
                        borderColor: brColor,
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        })
        console.log('Loaded bars!')
    }
}

function lineChart(labels, data, colors) {
    if (labels.length && data.length) {
        var ctx = document.getElementById("lineChart").getContext("2d")
        var lineChart = new Chart(ctx, {
            type: "line",
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
                            const chart = context.chart;
                            const {ctx, chartArea} = chart;
                        
                            if (!chartArea) {
                              // This case happens on initial chart load
                              return null;
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
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
            },
        })
        console.log('Loaded line!')
    }
}

let width, height, gradient;
function getGradient(ctx, chartArea) {
  const chartWidth = chartArea.right - chartArea.left;
  const chartHeight = chartArea.bottom - chartArea.top;
  if (gradient === null || width !== chartWidth || height !== chartHeight) {
    // Create the gradient because this is either the first render
    // or the size of the chart has changed
    width = chartWidth;
    height = chartHeight;
    gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
    gradient.addColorStop(0, '#ED859A')
    gradient.addColorStop(0.5, '#FFD452')
    gradient.addColorStop(1, '#84ECB6')
  }

  return gradient;
}