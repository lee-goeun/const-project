// import "./styles.css";
import React, {useState} from 'react'; 
import { Line } from "react-chartjs-2";

const data = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "First dataset",
      data: [33, 53, 85, 41, 44, 65],
      fill: true,
      backgroundColor: "rgba(75,192,192,0.2)",
      borderColor: "rgba(75,192,192,1)",
      options: {
        gridLines: {
          display: false,
          drawOnChartArea: false
        }
      }
    }
    // {
    //   label: "Second dataset",
    //   data: [33, 25, 35, 51, 54, 76],
    //   fill: false,
    //   borderColor: "#742774"
    // }
  ]
};

function LineChart(props) { 
  return (
    <div>
      <Line
        data={data}
        // redraw={true}
        options={{
          legend: {
            display: false
          }, 
          xAxis: {
            gridLines: { display: false}
          }, 
          yAxis: { 
            gridLines: {display: false}, 
            ticks: { display: false}
          }
          
          // scales: {
          //   xAxes: [
          //     {
          //       gridLines: {
          //         display: false
          //       }
          //     }
          //   ],
          //   yAxes: [
          //     {
          //       gridLines: {
          //         display: false
          //       }, 
          //       ticks: {
          //         display: false
          //       }
          //     }
          //   ]
          // }
        }}
      />
    </div>
  );
}

export default LineChart
