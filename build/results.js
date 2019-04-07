const { createCsvStream } = require('./utils');
const streamToPromise = require('stream-to-promise');
const through2 = require('through2');

const getKey = ({ tikId, uik }) => '' + tikId + uik;

const filterByUik = dic => through2.obj(function (data, enc, cb) {
  if (dic[getKey(data)]) {
    this.push(data);
  }
  cb(null, null);
});

const unwrapResult = ({ voters, totalVotes, 'Порошенко Петро': Poroshenko, 'Зеленський Володимир': Zelenskiy, 'Тимошенко Юлія': Tymoshenko }) =>
  ({ voters, totalVotes, Poroshenko, Zelenskiy, Tymoshenko });

const populate = (stationMap) => through2.obj(function (data, enc, cb) {
  const station = stationMap[getKey(data)];

  this.push({
    ...station,
    ...unwrapResult(data)
  });
  cb(null, null);
});

const populateStations = async (stations) => {

  const stationMap = stations.reduce((dic, station, index) => {
    dic[getKey(station)] = station;
    return dic;
  }, {});

  return streamToPromise(
    createCsvStream('./data/results_2019_18_40.csv')
      .pipe(filterByUik(stationMap))
      .pipe(populate(stationMap))
  );
};

module.exports = { populateStations };