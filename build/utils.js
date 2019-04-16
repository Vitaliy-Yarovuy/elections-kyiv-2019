const fs = require('fs');
const csv = require('fast-csv');
const through2 = require('through2');

const createCsvStream = file =>
  fs.createReadStream(file)
    .pipe(csv({ headers: true, delimiter: ';' }));

const toRadian = value => value  * Math.PI / 180;

const getDistance = (locA, locB) => {
  const R = 6371008.8;
  const dLat = toRadian(locA.lat - locB.lat); 
  const avgLat = toRadian((locA.lat + locB.lat)/2); 
  const dLon = toRadian(locA.lon - locB.lon); 
  return R * Math.sqrt(Math.pow(dLat, 2) + Math.pow(Math.cos(avgLat)*dLon,2));
} 

module.exports = { createCsvStream, getDistance };