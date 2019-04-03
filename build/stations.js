const { createCsvStream } = require('./utils');
const streamToPromise = require('stream-to-promise');
const through2 = require('through2');


const filterKyiv = through2.obj(function (data, enc, cb) {
  if (data.region === 'м.Київ') {
    this.push(data);
  }
  cb(null, null);
});

const takeFirst = count => through2.obj(function (data, enc, cb) {
  if (count-- > 0) {
    this.push(data);
  }
  cb(null, null);
});


const toStation = through2.obj(function (data, enc, cb) {
  this.push({
    ...data,
    lat: parseFloat(data.lat),
    lon: parseFloat(data.lon)
  });
  cb(null, null);
});

//region;tik;tikId;uik;address;center;city;lat;lon
const getStations = async () =>
  streamToPromise(
    createCsvStream('./data/stations_2019_g.csv')
    .pipe(filterKyiv)
    // .pipe(takeFirst(10))  
    .pipe(toStation)
  )

module.exports = { getStations };