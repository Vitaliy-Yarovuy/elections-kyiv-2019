const {createCsvStream} = require('./utils');
const merge2 = require('merge2');
const streamToPromise = require('stream-to-promise');
const through2 = require('through2');


const toStation = through2.obj(function (data, enc, cb) {
    this.push({
      name: data['станція метро'],
      lat: parseFloat(data['широта']),
      lon : parseFloat(data['довгота']),
    });
    cb(null, null);
  });

const getMetroStations = async ()=>
  streamToPromise(
      merge2([
        createCsvStream('./data/metro_blue.csv'),
        createCsvStream('./data/metro_green.csv'),
        createCsvStream('./data/metro_red.csv')
      ])
      .pipe(toStation)
    )


module.exports = { getMetroStations };