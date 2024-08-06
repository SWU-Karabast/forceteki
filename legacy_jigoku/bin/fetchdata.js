/*eslint no-console:0 */
const { default: axios } = require('axios');
const fs = require('fs/promises');
const mkdirp = require('mkdirp');
const path = require('path');

const pathToJSON = path.join(__dirname, '../test/json/Card');

const [, , env] = process.argv;
if (env !== 'beta' && env !== 'prod') {
    console.error('You must specify the environment to fetch data from. The options are `beta` or `prod`.');
    process.exit(1);
}

const host = env === 'beta' ? 'https://beta-emeralddb.herokuapp.com/api/' : 'https://www.emeralddb.org/api/';

function apiRequest(path) {
    return axios.get(host + path).then((res) => res.data);
}

apiRequest('cards')
    .then((cards) => {
        console.log(cards.length + ' cards fetched');
        mkdirp.sync(pathToJSON);
        return Promise.all(
            cards.map((card) => fs.writeFile(path.join(pathToJSON, `${card.id}.json`), JSON.stringify([card])))
        );
    })
    .then(() => console.log('fetched successfully'))
    .catch(() => console.log('error fetching'));
