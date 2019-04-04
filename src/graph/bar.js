import '@babel/polyfill'
import * as d3 from 'd3';


// Set the dimensions of the canvas / graph
const margin = { top: 30, right: 20, bottom: 30, left: 50 },
  width = 600 - margin.left - margin.right,
  height = 270 - margin.top - margin.bottom;

// Set the ranges
const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// Define the axes
const xAxis = d3.axisBottom(x).ticks(5);

const yAxis = d3.axisLeft(y).ticks(5);

// Define the line
const valueline = d3.line()
  .x(row => x(row.minDistance))
  .y(row => y(row.PoroshenkoPercent));

// Adds the svg canvas
const svg = d3.select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.dsv(';', './data/results_2019_kyiv.csv').then(function (data) {
  const results = data.map(({ voters, totalVotes, minDistance, Poroshenko, Zelenskiy }) => {
    voters = parseInt(voters);
    totalVotes = parseInt(totalVotes);
    minDistance = parseFloat(minDistance);
    Poroshenko = parseInt(Poroshenko);
    Zelenskiy = parseInt(Zelenskiy);

    return {
      minDistance,
      voters,
      totalVotes,
      Poroshenko,
      Zelenskiy,
    };
  });

  const step = 200;

  const groupedResults = Object.values(
    results.reduce((acc, row) => {
      const key = Math.floor(row.minDistance / step);
      if (!acc[key]) {
        acc[key] = {
          minDistance: (key + .5) * step,
          voters: 0,
          totalVotes: 0,
          Poroshenko: 0,
          Zelenskiy: 0
        };
      }
      acc[key].voters += row.voters;
      acc[key].totalVotes += row.totalVotes;
      acc[key].Poroshenko += row.Poroshenko;
      acc[key].Zelenskiy += row.Zelenskiy;
      return acc;
    }, {})
  );


  groupedResults.forEach(row => {
    row.PoroshenkoPercent = 100 * row.Poroshenko / row.totalVotes;
    row.ZelenskiyPercent = 100 * row.Zelenskiy / row.totalVotes;
  });


  // Scale the range of the data
  x.domain(d3.extent(groupedResults, row => row.minDistance));
  y.domain(d3.extent(groupedResults, row => row.PoroshenkoPercent));

  // Add the scatterplot
  svg.selectAll("dot")
    .data(groupedResults)
    .enter().append("circle")
    .attr("r", 3)
    .attr('fill', 'red')
    .attr("cx", row => x(row.minDistance))
    .attr("cy", row => y(row.PoroshenkoPercent));

  // Add the scatterplot
  svg.selectAll("dot")
    .data(groupedResults)
    .enter().append("circle")
    .attr("r", 3)
    .attr('fill', 'green')
    .attr("cx", row => x(row.minDistance))
    .attr("cy", row => y(row.ZelenskiyPercent));


  // Add the X Axis
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  // Add the Y Axis
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

});