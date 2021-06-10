// import "./styles.css";
import React, {useState} from 'react'; 
import { Line } from "react-chartjs-2";

const data = {
  labels: ['1/5', '1/10', '1/15', '1/20'],
  datasets: [
    {
      label: "First dataset",
      data: [33, 85, 41, 65],
      fill: true,
      backgroundColor: "rgba(149, 191, 255,0.2)",
      borderColor: "rgba(149, 191, 255, 1)",
      pointRadius: 1,
      pointHoverRadius: 1
    }
  ]
};

function LineChart(props) { 
  return (
    <div>
      <Line
        data={data}
        options={{
          legend: {
            display: false
          }, 
          scales: {
            xAxes: [{
              gridLines: {display:false}
            }],
            yAxes: [{
              ticks: {display: false}, 
              gridLines: {display:false}
            }]
          }
        }}
      />
    </div>
  );
}

export default LineChart;
