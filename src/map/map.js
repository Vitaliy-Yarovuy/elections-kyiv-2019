// import L from 'leaflet';
import * as d3 from 'd3';
import { Delaunay } from 'd3-delaunay';
import { geoVoronoi } from 'd3-geo-voronoi';

const map = L.map('map', {
  center: [50.4472, 30.5233],
  zoom: 14
});


L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);



export const setData = (data) => {

  data.forEach(row => {
    L.circle([row.lat, row.lon], { radius: 10 }).addTo(map);
  });


  const points = data.map(row => [row.lat, row.lon]);

  const bound = 0.001;
  const xmin = Math.min(...points.map(([x]) => x)) - bound;
  const ymin = Math.min(...points.map(([, y]) => y)) - bound;
  const xmax = Math.max(...points.map(([x]) => x)) + bound;
  const ymax = Math.max(...points.map(([, y]) => y)) + bound;

  console.log('bounds', [xmin, ymin, xmax, ymax])

  // console.log(points);
  const delaunay = Delaunay.from(points);
  const voronoi = delaunay.voronoi([xmin, ymin, xmax, ymax]);

  console.log(voronoi);

  const geoVR = geoVoronoi().polygons(points);
  console.log(geoVR);
  // console.log(voronoi.render());

  const poligons = voronoi.cellPolygons();
  for (const poligon of poligons) {
    // console.log(poligon);
    L.polygon(poligon).addTo(map);
  }

  // L.geoJSON(results, {
  //   style: function (feature) {
  //     return { color: 'red'/*feature.properties.color*/ };
  //   }
  // }).bindPopup(function (layer) {
  //   return 'layer.feature.properties.description';
  // }).addTo(map);




}