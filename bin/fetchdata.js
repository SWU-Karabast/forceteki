/*eslint no-console:0 */
const { default: axios } = require('axios');
const { log } = require('console');
const fs = require('fs/promises');
const mkdirp = require('mkdirp');
const path = require('path');
const cliProgress = require('cli-progress');

const pathToJSON = path.join(__dirname, '../test/json/');

function getAttributeNames(attributeList) {
    if (Array.isArray(attributeList.data)) {
        return attributeList.data.map((attr) => attr.attributes.name.toLowerCase());
    }

    return attributeList.data.attributes.name.toLowerCase();
}

function filterValues(card) {
    // just filter out variants for now
    // TODO: add some map for variants
    if (card.attributes.variantOf.data !== null) {
        return null;
    }

    // filtering out TWI for now since the cards don't have complete data
    if (card.attributes.expansion.data.attributes.code === 'TWI') {
        return null;
    }

    // hacky way to strip the object down to just the attributes we want
    const filterAttributes = ({ title, subtitle, cost, hp, power, text, deployBox, epicAction, unique, rules }) =>
        ({ title, subtitle, cost, hp, power, text, deployBox, epicAction, unique, rules });

    let filteredObj = filterAttributes(card.attributes);

    filteredObj.id = card.attributes.cardId || card.attributes.cardUid;
    filteredObj.aspects = getAttributeNames(card.attributes.aspects);
    filteredObj.traits = getAttributeNames(card.attributes.traits);
    filteredObj.arena = getAttributeNames(card.attributes.arenas)[0];
    filteredObj.keywords = getAttributeNames(card.attributes.keywords);

    // if a card has multiple types it will be still in one string, like 'token upgrade'
    filteredObj.types = getAttributeNames(card.attributes.type).split(' ');

    let internalName = filteredObj.title;
    if (filteredObj.subtitle) {
        internalName += '#' + filteredObj.subtitle;
    }
    filteredObj.internalName = internalName.toLowerCase().replace(/[^\w\s#]|_/g, '')
        .replace(/\s/g, '-');

    // keep original card for debug logging, will be removed before card is written to file
    delete card.attributes.variants;
    filteredObj.debugObject = card;

    return filteredObj;
}

function getCardData(page, progressBar) {
    return axios.get('https://admin.starwarsunlimited.com/api/cards?pagination[page]=' + page)
        .then((res) => res.data.data)
        .then((cards) => {
            mkdirp.sync(pathToJSON);
            mkdirp.sync(path.join(pathToJSON, 'Card'));
            progressBar.increment();
            return Promise.all(
                cards.map((card) => filterValues(card))
            );
        })
        .catch((error) => console.log('error fetching: ' + error));
}

async function main() {
    let pageData = await axios.get('https://admin.starwarsunlimited.com/api/cards');
    let totalPageCount = pageData.data.meta.pagination.pageCount;

    console.log('downloading card definitions');
    const downloadProgressBar = new cliProgress.SingleBar({ format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total}' });
    downloadProgressBar.start(totalPageCount, 0);

    let cards = (await Promise.all([...Array(totalPageCount).keys()]
        .map((pageNumber) => getCardData(pageNumber + 1, downloadProgressBar))))
        .flat()
        .filter((n) => n); // remove nulls

    downloadProgressBar.stop();

    var cardMap = [];
    var seenNames = [];
    var duplicatesWithSetCode = {};
    var uniqueCards = [];
    for (const card of cards) {
        if (seenNames.includes(card.internalName)) {
            if (duplicatesWithSetCode[card.internalName] === null) {
                duplicatesWithSetCode[card.internalName] = cards.filter((c) => c.internalName === card.internalName)
                    .map((c) => c.debugObject.attributes.expansion.data.attributes.code);
            }
            continue;
        }

        seenNames.push(card.internalName);
        cardMap.push({ id: card.id, internalName: card.internalName, title: card.title, subtitle: card.subtitle });
        uniqueCards.push(card);
    }

    cards.map((card) => delete card.debugObject);

    console.log('\nwriting card definition files');
    const fileWriteProgressBar = new cliProgress.SingleBar({ format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total}' });
    fileWriteProgressBar.start(uniqueCards.length, 0);

    await Promise.all(uniqueCards.map(async (card) => {
        fs.writeFile(path.join(pathToJSON, `Card/${card.internalName}.json`), JSON.stringify([card], null, 2));
        fileWriteProgressBar.increment();
    }));

    fileWriteProgressBar.stop();

    // TODO: better way to handle duplicates between sets
    // if (duplicatesWithSetCode) {
    //     console.log(`Duplicate cards found, with set codes: ${JSON.stringify(duplicatesWithSetCode, null, 2)}`);
    // }

    fs.writeFile(path.join(pathToJSON, '_cardMap.json'), JSON.stringify(cardMap, null, 2));

    console.log(`\n${uniqueCards.length} card definition files downloaded to ${pathToJSON}`);
}

// TODO: some downloads can fail due to request issues, either improve the retry settings or add
// some check on number of downloaded cards so we can have an error message

// TODO: upload the set of card jsons as a github artifact so we're not relying on downloading
// from the SWU site
main();
