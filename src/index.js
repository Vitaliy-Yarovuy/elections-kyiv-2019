import '@babel/polyfill'
import * as d3 from "d3";

const width = 500;
const height = 350;
const barOffset = 5;
const barWidth = 50;
const chartdata = [40, 60, 80, 100, 70, 120, 100, 60, 70, 150, 120, 140];

const svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .selectAll('rect')
  .data(chartdata)
  .enter()
  .append('rect')

  .attr('width', barWidth)
  .attr('height', function (data) {
    return data;
  })
  .attr('x', (data, i) => i * (barWidth + barOffset))
  .attr('y', data => height - data)
  .style('fill', '#3c763d')
  .exit();


  async function run(){
    const stations = await d3.dsv(';','/data/stations_2019_d.csv');
    const results = await d3.dsv(';','/data/results_2019_08_56.csv');
    const metroRed = await d3.dsv(';','/data/metro_red.csv');
    const metroBlue = await d3.dsv(';','/data/metro_blue.csv');
    const metroGreen = await d3.dsv(';','/data/metro_green.csv');

    const metro = [... metroRed, ...metroGreen, ...metroBlue];
    metro.columns = metroRed.columns;
    console.log(metro);
    console.log(results);

    const kyivStations = stations.filter(row =>  row.region === "м.Київ");
    console.log(kyivStations);
  }

  run();