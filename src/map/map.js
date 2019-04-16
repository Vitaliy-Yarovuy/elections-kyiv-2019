// import L from 'leaflet';
import * as d3 from 'd3';
import { debounce } from 'lodash';
import './legend';
import { promisify } from 'es6-promisify';
import { Delaunay } from 'd3-delaunay';
import clipping from 'polygon-clipping';
import kmeans from 'node-kmeans';
import kyiv from '../../data/kyiv-simple.geo.json';
import { candidates } from '../config';
import { calculatePercentage, percentageKey } from '../graph/base';


const kyivPoligon = kyiv.geometry.coordinates[0];
const kyivPoligonExclude = kyiv.geometry.coordinates[1];


kyivPoligon.forEach(p => p.reverse());
kyivPoligonExclude.forEach(p => p.reverse());

const delta = 0.001;
const xmin = Math.min(...kyivPoligon.map(([x]) => x)) - delta;
const ymin = Math.min(...kyivPoligon.map(([, y]) => y)) - delta;
const xmax = Math.max(...kyivPoligon.map(([x]) => x)) + delta;
const ymax = Math.max(...kyivPoligon.map(([, y]) => y)) + delta;
const bounds = [xmin, ymin, xmax, ymax];


const map = L.map('map', {
  center: [50.4472, 30.5233],
  zoom: 10
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

  let clusterizeK = 3;
  const kMeanLabel = L.control.label({ position: 'topright' });

  const slider = L.control.range({
    position: 'topright',
    min: 3,
    max: 150,
    value: clusterizeK,
    step: 1,
    orient: 'vertical',
    iconClass: 'leaflet-range-icon'
  });

  slider.on('input change', function (e) {
    clusterizeK = e.value;
    run();
  });


  let timerId;
  kMeanLabel.on('change', function (e) {
    const checked = e.value;
    if (!checked) {
      clearInterval(timerId);
      timerId = null;
    } else {
      timerId = setInterval(run, 2000);
    }
  });


  map.addControl(kMeanLabel);
  map.addControl(slider);

  const vectors = data.map(row => [row.lat, row.lon]);
  const keysToSum = ['totalVotes', 'voters', ...Object.keys(candidates)];
  const layers = [];

  const run = debounce(async function () {
    kMeanLabel.setText(`k-means:${clusterizeK}`);

    const clusterize = promisify(kmeans.clusterize);

    const res = await clusterize(vectors, { k: clusterizeK });

    const results = res.map(item => {
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

    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi(bounds);

    let layer;
    while (layer = layers.pop()) {
      layer.remove();
    }

    const poligons = voronoi.cellPolygons();
    let i = 0;

    for (const poligon of poligons) {
      const row = results.find(row => voronoi.contains(i, row.lat, row.lon));

      let newPoligon = clipping.intersection([poligon], [kyivPoligon]);
      if (newPoligon) {
        newPoligon = clipping.difference(newPoligon, [kyivPoligonExclude]);
      }
      if (newPoligon) {
        layers.push(L.polygon(newPoligon, { weight: 1, ...getPoligonStyle(row) }).addTo(map));
      }

      layers.push(L.circle([row.lat, row.lon], { radius: 6, color: '#555' }).addTo(map));

      i++;
    }

  }, 200);

  run();
}