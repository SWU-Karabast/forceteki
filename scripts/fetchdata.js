/* eslint no-console:0 */
const { default: axios } = require('axios');
const { default: axiosRetry } = require('axios-retry');
const { Agent } = require('https');
const { log } = require('console');
const fs = require('fs/promises');
const mkdirp = require('mkdirp');
const path = require('path');
const cliProgress = require('cli-progress');

// ############################################################################
// #################                 IMPORTANT              ###################
// ############################################################################
// if you are updating this script in a way that will change the card data,
// you must also update card-data-version.txt with a new version number
// so that the pipeline and other devs will know to update the card data

const pathToJSON = path.join(__dirname, '../test/json/');

axiosRetry(axios, {
    retries: 3,
    retryDelay: () => (Math.random() * 2000) + 1000      // jitter retry delay by 1 - 3 seconds
});

function populateMissingData(attributes, id) {
    switch (id) {
        case '3941784506': // clone trooper
        case '3463348370': // battle droid
            attributes.type = {
                data: {
                    attributes: {
                        name: 'token unit'
                    }
                }
            };
            break;
        case '8752877738': // shield
            attributes.upgradeHp = 0;
            attributes.upgradePower = 0;
            break;
        case '8777351722': // Anakin Skywalker - What It Takes To Win
            attributes.keywords = {
                data: [{
                    attributes: {
                        name: 'Overwhelm'
                    }
                }]
            };
            break;
        case '0026166404': // Chancellor Palpatine - Playing Both Sides
            attributes.aspects = {
                data: [{ attributes: {
                    name: 'Cunning'
                } },
                { attributes: {
                    name: 'Heroism'
                } }
                ]
            };
            attributes.backSideAspects = {
                data: [{ attributes: {
                    name: 'Cunning'
                } },
                { attributes: {
                    name: 'Villainy'
                } }
                ]
            };
            attributes.backSideTitle = 'Darth Sidious';
            break;
    }
}

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

    // filtering out C24 for now since we do not handle variants
    if (card.attributes.expansion.data.attributes.code === 'C24') {
        return null;
    }

    // hacky way to strip the object down to just the attributes we want
    const filterAttributes = ({ title, backSideTitle, subtitle, cost, hp, power, text, deployBox, epicAction, unique, rules, reprints }) =>
        ({ title, backSideTitle, subtitle, cost, hp, power, text, deployBox, epicAction, unique, rules, reprints });

    let filteredObj = filterAttributes(card.attributes);

    filteredObj.id = card.attributes.cardId || card.attributes.cardUid;

    populateMissingData(card.attributes, filteredObj.id);

    if (card.attributes.upgradeHp != null) {
        filteredObj.hp = card.attributes.upgradeHp;
    }

    if (card.attributes.upgradePower != null) {
        filteredObj.power = card.attributes.upgradePower;
    }

    filteredObj.aspects = getAttributeNames(card.attributes.aspects).concat(getAttributeNames(card.attributes.aspectDuplicates));
    filteredObj.traits = getAttributeNames(card.attributes.traits);
    filteredObj.arena = getAttributeNames(card.attributes.arenas)[0];
    filteredObj.keywords = getAttributeNames(card.attributes.keywords);

    if (card.attributes.backSideAspects) {
        filteredObj.backSideAspects = getAttributeNames(card.attributes.backSideAspects);
    }
    if (card.attributes.backSideTitle) {
        filteredObj.backSideTitle = card.attributes.backSideTitle;
    }

    // if a card has multiple types it will be still in one string, like 'token upgrade'
    filteredObj.types = getAttributeNames(card.attributes.type).split(' ');

    filteredObj.setId = { set: card.attributes.expansion.data.attributes.code };

    // tokens use a different numbering scheme, can ignore for now
    if (!filteredObj.types.includes('token')) {
        filteredObj.setId.number = card.attributes.cardNumber;
    }

    let internalName = filteredObj.title;
    internalName += filteredObj.subtitle ? '#' + filteredObj.subtitle : '';
    // remove accents / diacritics (e.g., 'Chirrut Îmwe' -> 'Chirrut Imwe')
    internalName = internalName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
        .catch((error) => {
            throw new Error(`Request error retrieving data: ${error.code} ${error.response?.data?.message || ''}`);
        });
}

function getUniqueCards(cards) {
    const cardMap = [];
    const setCodeMap = {};
    const playableCardTitlesSet = new Set();
    const seenNames = [];
    var duplicatesWithSetCode = {};
    const uniqueCardsMap = new Map();
    const setNumber = new Map([['SOR', 1], ['SHD', 2], ['TWI', 3], ['JTL', 4]]);

    for (const card of cards) {
        // creates a map of set code + card number to card id. removes reprints when done since we don't need that in the card data
        if (!card.types.includes('token')) {
            setCodeMap[`${card.setId.set}_${String(card.setId.number).padStart(3, '0')}`] = card.id;

            let mostRecentSetCode = card.setId;
            for (const reprint of card.reprints.data) {
                const setCode = reprint.attributes.expansion.data.attributes.code;
                if (setCode && setNumber.has(setCode)) {
                    setCodeMap[`${setCode}_${String(reprint.attributes.cardNumber).padStart(3, '0')}`] = card.id;
                }

                mostRecentSetCode = {
                    set: reprint.attributes.expansion.data.attributes.code,
                    number: reprint.attributes.cardNumber
                };
            }
            card.setId = mostRecentSetCode;
        }
        delete card.reprints;

        if (seenNames.includes(card.internalName)) {
            if (duplicatesWithSetCode[card.internalName] === null) {
                duplicatesWithSetCode[card.internalName] = cards.filter((c) => c.internalName === card.internalName)
                    .map((c) => c.debugObject.attributes.expansion.data.attributes.code);
            }
            const uniqueCardEntry = uniqueCardsMap.get(card.internalName);
            if (setNumber.get(card.setId.set) < setNumber.get(uniqueCardEntry.setId.set)) {
                uniqueCardEntry.setId = card.setId;
            }
            continue;
        }

        seenNames.push(card.internalName);
        cardMap.push({ id: card.id, internalName: card.internalName, title: card.title, subtitle: card.subtitle });

        if (!card.types.includes('token') && !card.types.includes('leader') && !card.types.includes('base')) {
            playableCardTitlesSet.add(card.title);
        }

        uniqueCardsMap.set(card.internalName, card);
    }

    const playableCardTitles = Array.from(playableCardTitlesSet);
    playableCardTitles.sort();

    const uniqueCards = [...uniqueCardsMap].map(([internalName, card]) => card);
    return { uniqueCards, cardMap, playableCardTitles, duplicatesWithSetCode, setCodeMap };
}

async function main() {
    axios.defaults.httpAgent = new Agent({
        maxSockets: 8,
    });
    axios.defaults.httpsAgent = new Agent({
        maxSockets: 8,
    });

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

    const { uniqueCards, cardMap, playableCardTitles, duplicatesWithSetCode, setCodeMap } = getUniqueCards(cards);

    cards.map((card) => delete card.debugObject);

    console.log('\nwriting card definition files');
    const fileWriteProgressBar = new cliProgress.SingleBar({ format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total}' });
    fileWriteProgressBar.start(uniqueCards.length, 0);

    await Promise.all(uniqueCards.map((card) => {
        fs.writeFile(path.join(pathToJSON, `Card/${card.internalName}.json`), JSON.stringify([card], null, 2));
        fileWriteProgressBar.increment();
    }));

    fileWriteProgressBar.stop();

    // TODO: better way to handle duplicates between sets
    // if (duplicatesWithSetCode) {
    //     console.log(`Duplicate cards found, with set codes: ${JSON.stringify(duplicatesWithSetCode, null, 2)}`);
    // }

    fs.writeFile(path.join(pathToJSON, '_cardMap.json'), JSON.stringify(cardMap, null, 2));
    fs.writeFile(path.join(pathToJSON, '_playableCardTitles.json'), JSON.stringify(playableCardTitles, null, 2));
    fs.writeFile(path.join(pathToJSON, '_setCodeMap.json'), JSON.stringify(setCodeMap, null, 2));
    fs.copyFile(path.join(__dirname, '../card-data-version.txt'), path.join(pathToJSON, 'card-data-version.txt'));

    console.log(`\n${uniqueCards.length} card definition files downloaded to ${pathToJSON}`);
}

main();
