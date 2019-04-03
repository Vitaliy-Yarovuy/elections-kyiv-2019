const { getMetroStations } = require('./metro');
const { getStations } = require('./stations');
const { getDistance } = require('./utils');
const { populateStations } = require('./results');
const streamToPromise = require('stream-to-promise');
const csv = require('fast-csv')

async function run() {
  const metroStations = await getMetroStations();
  const stations = await getStations();


  const stationsWithDistance = stations.map(station => {
    const minDistance = Math.min(
      ...metroStations.map(
        mStation => getDistance(mStation, station)
      )
    );

    return {
      ...station,
      minDistance
    }
  });


  stationsWithDistance.sort((a, b) => a.minDistance - b.minDistance);

  const results = await populateStations(stationsWithDistance)

  await streamToPromise(
    csv.writeToPath("dist/data/results_2019_kyiv.csv", results, {headers: true, delimiter: ';'})
  );

  //console.log(stationsWithDistance.map(({ address, minDistance }) => [address, minDistance]));
  //console.log(results);
}

const t = new Date;
run().then(() => {
  console.log(`time:${new Date - t}`);
})
