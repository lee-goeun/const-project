import React from 'react';
import { Doughnut } from 'react-chartjs-2';

function DoughnutChart(props) { 

  const tokens = props.data; 

  let labels = [];
  let values = [];
  if (tokens) {
    for (const [key, value] of Object.entries(tokens)) {
      labels.push(key); 
      values.push(value.token_balance); 
    }
  } else{ 
    labels = ['1','2','3','4'];
    values = [1, 2, 3, 4]; 
  }

  let data = {
    labels: labels, 
    datasets: [
      {
        data: values, 
        backgroundColor: [
          '#8EB2FF',
          '#6B69F7',
          '#B095FF',
          '#D2D2D2'
        ], 
        borderWidth: 1,
        legend: { 
          display: true, 
          position: 'right'
        },
        options: {
          gridLines: {
            display: false,
            drawOnChartArea: false
          }, 
          legend: { 
            display: true, 
            position: 'right'
          }
        }
      }
    ]
  }

  return (
    <Doughnut 
      data={data}
      legend={{
        display: true, 
        position: 'right', 
        generateLabels: function(chart) {
          let data = chart.data;
          if (data.labels.length) {
            return data.labels.map(function(label, i) {
              let ds = data.datasets[0];
                return {
                text: `${label}: ${ds.data[i]}`,
                index: i
              };
            })
          }
          return [];
        }
      }}

      options={{
        legend: {
          display: true,
          position: 'right'}
      }}

    />
  )
}

export default DoughnutChart;