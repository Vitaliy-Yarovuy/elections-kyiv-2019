// import L from 'leaflet';
import * as d3 from 'd3';
import { promisify } from 'es6-promisify';
import { Delaunay } from 'd3-delaunay';
import { geoVoronoi } from 'd3-geo-voronoi';
import clipping from 'polygon-clipping';
import kmeans from 'node-kmeans';
import kyiv from '../../data/kyiv-simple.geo.json';
import { candidates } from '../config';
import { calculatePercentage, percentageKey } from '../graph/base';


const kyivPoligon = kyiv.geometry.coordinates[0];
const kyivPoligonExclude = kyiv.geometry.coordinates[1];


kyivPoligon.forEach(p => p.reverse());
kyivPoligonExclude.forEach(p => p.reverse());


// console.log(kyivPoligon);
// console.log(kyivPoligonExclude);

const map = L.map('map', {
  center: [50.4472, 30.5233],
  zoom: 14
});


L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


L.polygon(kyivPoligon, {
  fillColor: 'white', weight: 1, fillOpacity: 0, color: 'black'
}).addTo(map);


const getPoligonStyle = (row) => {
  const results = Object.keys(candidates).map(candidate => {
    const color = candidates[candidate].color;
    const percent = row[percentageKey(candidate)];
    return {
      color,
      candidate,
      percent
    }
  }).sort((a, b) => b.percent - a.percent);

  return {
    fillColor: results[0].color,
    fillOpacity: 0.6 * Math.min((results[0].percent - results[1].percent) / 10, 1),
    color: results[0].color,
  }
}


export const setData = async (data) => {
  // data.forEach(row => {
  //   L.circle([row.lat, row.lon], { radius: 10 }).addTo(map);
  // });

  const vectors = data.map(row => [row.lat, row.lon]);

  let results;

  const keysToSum = ['totalVotes', 'voters', ...Object.keys(candidates)];

  const clusterize = promisify(kmeans.clusterize);

  const res = await clusterize(vectors, { k: 10 })

  results = res.map(item => {
    return {
      lat: item.centroid[0],
      lon: item.centroid[1],
      ...keysToSum.reduce((acc, key) => {
        acc[key] = item.clusterInd.map(
          i => data[i][key]
        ).reduce((sum, value) => sum + value, 0)
        return acc;
      }, {})
    }
  });

  results.forEach(row => calculatePercentage(row));

  const points = results.map(row => [row.lat, row.lon]);

  const bound = 0.001;
  const xmin = Math.min(...kyivPoligon.map(([x]) => x)) - bound;
  const ymin = Math.min(...kyivPoligon.map(([, y]) => y)) - bound;
  const xmax = Math.max(...kyivPoligon.map(([x]) => x)) + bound;
  const ymax = Math.max(...kyivPoligon.map(([, y]) => y)) + bound;

  console.log('bounds', [xmin, ymin, xmax, ymax])

  // console.log(points);
  const delaunay = Delaunay.from(points);
  const voronoi = delaunay.voronoi([xmin, ymin, xmax, ymax]);

  // console.log(voronoi);

  // const geoVR = geoVoronoi().polygons(points);
  // console.log(geoVR);
  // console.log(voronoi.render());


  let i = 0;
  const poligons = voronoi.cellPolygons();
  for (const poligon of poligons) {
    // console.log(poligon);




    //if (i > 1100) {
    // L.polygon(poligon).addTo(map);

    const row = results.find(row => voronoi.contains(i, row.lat, row.lon))


    // L.circle([row.lat, row.lon], { radius: 1, weight: 1 }).addTo(map);

    const newPoligon = clipping.intersection([poligon], [kyivPoligon]);
    //console.log('track', poligon, kyivPoligon, newPoligon);

    if (newPoligon) {
      L.polygon(newPoligon, { weight: 1, ...getPoligonStyle(row) }).addTo(map);
    }

    //}
    // const newPoligon = martinez.diff(poligon, kyivPoligon);
    // console.log(poligon, newPoligon);

    // if (newPoligon) {
    //   L.polygon(newPoligon).addTo(map);
    //   console.log(newPoligon);
    // }

    i++;
  }

  // L.geoJSON(results, {
  //   style: function (feature) {
  //     return { color: 'red'/*feature.properties.color*/ };
  //   }
  // }).bindPopup(function (layer) {
  //   return 'layer.feature.properties.description';
  // }).addTo(map);




}