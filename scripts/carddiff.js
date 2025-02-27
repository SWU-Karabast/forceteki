/* eslint no-console:0 */
const { default: axios } = require('axios');
const { default: axiosRetry } = require('axios-retry');
const { Agent } = require('https');
const fs = require('fs/promises');
const mkdirp = require('mkdirp');
const path = require('path');
const cliProgress = require('cli-progress');

axiosRetry(axios, {
    retries: 3,
    retryDelay: () => (Math.random() * 2000) + 1000      // jitter retry delay by 1 - 3 seconds
});

function getInternalName(title, subtitle) {
    var internalName = title;
    internalName += (subtitle !== null && subtitle !== '' ? '#' + subtitle : '');
    internalName = internalName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    internalName = internalName.toLowerCase().replace(/[^\w\s#]|_/g, '')
        .replace(/\s/g, '-');

    return internalName;
}

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
        case '8862896760': // Maul - Shadow Collective Visionary
            attributes.text = 'Ambush\nOverwhelm\nOn Attack: You may choose another friendly Underworld unit. If you do, all combat damage that would be dealt to this unit during this attack is dealt to the chosen unit instead.';
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

    filteredObj.text = card.attributes.text;

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

    filteredObj.internalName = getInternalName(filteredObj.title, filteredObj.subtitle);

    /*
    let internalName = filteredObj.title;
    internalName += filteredObj.subtitle ? '#' + filteredObj.subtitle : '';
    // remove accents / diacritics (e.g., 'Chirrut Îmwe' -> 'Chirrut Imwe')
    internalName = internalName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    filteredObj.internalName = internalName.toLowerCase().replace(/[^\w\s#]|_/g, '')
        .replace(/\s/g, '-');
    */

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

function buildCardLists(cards) {
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
            const setCodeStr = `${card.setId.set}_${String(card.setId.number).padStart(3, '0')}`;
            if (!setCodeMap.hasOwnProperty(setCodeStr)) {
                setCodeMap[setCodeStr] = card.id;
            }

            let mostRecentSetCode = card.setId;
            for (const reprint of card.reprints.data) {
                const setCode = reprint.attributes.expansion.data.attributes.code;
                if (setCode && setNumber.has(setCode)) {
                    setCodeMap[`${setCode}_${String(reprint.attributes.cardNumber).padStart(3, '0')}`] = card.id;

                    mostRecentSetCode = {
                        set: reprint.attributes.expansion.data.attributes.code,
                        number: reprint.attributes.cardNumber
                    };
                }
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
        cardMap.push({ id: card.id, internalName: card.internalName, title: card.title, subtitle: card.subtitle, cost: card.cost });

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

async function retrieveCards(filtered = true) {
    axios.defaults.httpAgent = new Agent({
        maxSockets: 8,
    });
    axios.defaults.httpsAgent = new Agent({
        maxSockets: 8,
    });

    const apiUrl = 'https://admin.starwarsunlimited.com/api/cards';
    const pageResponse = await axios.get(apiUrl);
    const totalPages = pageResponse.data.meta.pagination.pageCount;

    if (totalPages <= 0) {
        throw new Error('No pages found.');
    }

    var cards = [];
    if (filtered) {
        console.log('downloading card definitions');
        const downloadProgressBar = new cliProgress.SingleBar({ format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total}' });
        downloadProgressBar.start(totalPageCount, 0);

        let cards = (await Promise.all([...Array(totalPageCount).keys()]
            .map((pageNumber) => getCardData(pageNumber + 1, downloadProgressBar))))
            .flat()
            .filter((n) => n); // remove nulls

        downloadProgressBar.stop();

        const { uniqueCards, cardMap, playableCardTitles, duplicatesWithSetCode, setCodeMap } = buildCardLists(cards);

        cards.map((card) => delete card.debugObject);

        console.log('\nwriting card definition files');
        const fileWriteProgressBar = new cliProgress.SingleBar({ format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total}' });
        fileWriteProgressBar.start(uniqueCards.length, 0);

        await Promise.all(uniqueCards.map((card) => {
            fs.writeFile(path.join(pathToJSON, `Card/${card.internalName}.json`), JSON.stringify(card, null, 2));
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
    } else {
        try {
            cards = (await Promise.all([...Array(totalPages).keys()].map((i) => axios.get(apiUrl + '?pagination[page]=' + (i + 1)).then((res) => res.data.data)))).flat();
        } catch (error) {
            console.error('Error getting card data:', error);
        }
    }

    return cards;
}

function getConflicts(cards, flag = true, fileOutput = '') {
    if (cards.length <= 0) {
        throw new Error('No card data found.');
    }

    var verified = {};
    var verifiedData = {};
    var conflictingResults = {};
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i].attributes;
        const cardIdentifier = getInternalName(card.title, card.subtitle);

        if (!(cardIdentifier in verified)) {
            verified[cardIdentifier] = {};
        }

        verified[cardIdentifier][card.cardUid] = {
            title: card.title,
            subtitle: card.subtitle || '',
            arenas: [],
            aspects: [],
            cost: card.cost,
            hp: card.hp,
            keywords: [],
            power: card.power,
            traits: [],
            types: [],
            unique: card.unique,
            upgradeHp: card.upgradeHp,
            upgradePower: card.upgradePower,
            cardUid: card.cardUid
        };
        for (let j = 0; j < card.arenas.data.length; j++) {
            verified[cardIdentifier][card.cardUid].arenas.push(card.arenas.data[j].attributes.name);
        }
        for (let j = 0; j < card.aspects.data.length; j++) {
            verified[cardIdentifier][card.cardUid].aspects.push(card.aspects.data[j].attributes.name);
        }
        for (let j = 0; j < card.aspectDuplicates.data.length; j++) {
            verified[cardIdentifier][card.cardUid].aspects.push(card.aspectDuplicates.data[j].attributes.name);
        }
        for (let j = 0; j < card.keywords.data.length; j++) {
            verified[cardIdentifier][card.cardUid].keywords.push(card.keywords.data[j].attributes.name);
        }
        for (let j = 0; j < card.traits.data.length; j++) {
            verified[cardIdentifier][card.cardUid].traits.push(card.traits.data[j].attributes.name);
        }
        if (card.type.data !== null) {
            verified[cardIdentifier][card.cardUid].types.push(card.type.data.attributes.name);
        }
        if (card.type2.data !== null) {
            verified[cardIdentifier][card.cardUid].types.push(card.type2.data.attributes.name);
        }

        verified[cardIdentifier][card.cardUid].arenas = verified[cardIdentifier][card.cardUid].arenas.sort().join(', ');
        verified[cardIdentifier][card.cardUid].aspects = verified[cardIdentifier][card.cardUid].aspects.sort().join(', ');
        verified[cardIdentifier][card.cardUid].keywords = verified[cardIdentifier][card.cardUid].keywords.sort().join(', ');
        verified[cardIdentifier][card.cardUid].traits = verified[cardIdentifier][card.cardUid].traits.sort().join(', ');
        verified[cardIdentifier][card.cardUid].types = verified[cardIdentifier][card.cardUid].types.sort().join(', ');

        if (verified[cardIdentifier][card.cardUid].types.includes('Upgrade')) {
            if (verified[cardIdentifier][card.cardUid].upgradeHp === null) {
                verified[cardIdentifier][card.cardUid].upgradeHp = 0;
            }
            if (verified[cardIdentifier][card.cardUid].upgradePower === null) {
                verified[cardIdentifier][card.cardUid].upgradePower = 0;
            }
        }
    }

    const cardKeys = Object.keys(verified);
    for (let i = 0; i < cardKeys.length; i++) {
        const cardKey = cardKeys[i];
        const cardUids = Object.keys(verified[cardKey]);

        if (!(cardKey in verifiedData)) {
            verifiedData[cardKey] = {
                title: {},
                subtitle: {},
                arenas: {},
                aspects: {},
                cost: {},
                hp: {},
                keywords: {},
                power: {},
                traits: {},
                types: {},
                unique: {},
                upgradeHp: {},
                upgradePower: {}
            };
        }

        for (let j = 0; j < cardUids.length; j++) {
            const cardUid = cardUids[j];
            const card = verified[cardKey][cardUid];

            if (Object.keys(verifiedData[cardKey].title).indexOf(card.title) < 0) {
                verifiedData[cardKey].title[card.title] = [];
            }
            verifiedData[cardKey].title[card.title].push(cardUid);

            if (Object.keys(verifiedData[cardKey].subtitle).indexOf(card.subtitle) < 0) {
                verifiedData[cardKey].subtitle[card.subtitle] = [];
            }
            verifiedData[cardKey].subtitle[card.subtitle].push(cardUid);

            if (Object.keys(verifiedData[cardKey].arenas).indexOf(card.arenas) < 0) {
                verifiedData[cardKey].arenas[card.arenas] = [];
            }
            verifiedData[cardKey].arenas[card.arenas].push(cardUid);

            if (Object.keys(verifiedData[cardKey].aspects).indexOf(card.aspects) < 0) {
                verifiedData[cardKey].aspects[card.aspects] = [];
            }
            verifiedData[cardKey].aspects[card.aspects].push(cardUid);

            if (Object.keys(verifiedData[cardKey].cost).indexOf(card.cost) < 0) {
                verifiedData[cardKey].cost[card.cost] = [];
            }
            verifiedData[cardKey].cost[card.cost].push(cardUid);

            if (Object.keys(verifiedData[cardKey].hp).indexOf(card.hp) < 0) {
                verifiedData[cardKey].hp[card.hp] = [];
            }
            verifiedData[cardKey].hp[card.hp].push(cardUid);

            if (Object.keys(verifiedData[cardKey].keywords).indexOf(card.keywords) < 0) {
                verifiedData[cardKey].keywords[card.keywords] = [];
            }
            verifiedData[cardKey].keywords[card.keywords].push(cardUid);

            if (Object.keys(verifiedData[cardKey].power).indexOf(card.power) < 0) {
                verifiedData[cardKey].power[card.power] = [];
            }
            verifiedData[cardKey].power[card.power].push(cardUid);

            if (Object.keys(verifiedData[cardKey].traits).indexOf(card.traits) < 0) {
                verifiedData[cardKey].traits[card.traits] = [];
            }
            verifiedData[cardKey].traits[card.traits].push(cardUid);

            if (Object.keys(verifiedData[cardKey].types).indexOf(card.types) < 0) {
                verifiedData[cardKey].types[card.types] = [];
            }
            verifiedData[cardKey].types[card.types].push(cardUid);

            if (Object.keys(verifiedData[cardKey].unique).indexOf(card.unique) < 0) {
                verifiedData[cardKey].unique[card.unique] = [];
            }
            verifiedData[cardKey].unique[card.unique].push(cardUid);

            if (Object.keys(verifiedData[cardKey].upgradeHp).indexOf(card.upgradeHp) < 0) {
                verifiedData[cardKey].upgradeHp[card.upgradeHp] = [];
            }
            verifiedData[cardKey].upgradeHp[card.upgradeHp].push(cardUid);

            if (Object.keys(verifiedData[cardKey].upgradePower).indexOf(card.upgradePower) < 0) {
                verifiedData[cardKey].upgradePower[card.upgradePower] = [];
            }
            verifiedData[cardKey].upgradePower[card.upgradePower].push(cardUid);
        }

        var mismatch = false;
        for (let j = 0; j < Object.keys(verifiedData[cardKey]).length; j++) {
            const key = Object.keys(verifiedData[cardKey])[j];
            if (Object.keys(verifiedData[cardKey][key]).length !== 1) {
                mismatch = true;
                break;
            }
        }

        if (mismatch) {
            conflictingResults[cardKey] = verifiedData[cardKey];
        }
    }

    if (fileOutput !== '') {
        console.log('\nWriting comparison results');
        fs.writeFileSync(fileOutput, JSON.stringify(conflictingResults, null, 2));
        console.log(`\nComparison results saved to ${fileOutput}`);
    }

    if (flag) {
        if (Object.keys(conflictingResults).length > 0) {
            console.log('Found some conflicts. Run `npm run card-diff` to see the specifics.');
        }
        return (Object.keys(conflictingResults).length > 0);
    }
    return conflictingResults;
}

async function main() {
    const cards = await retrieveCards(false);
    const conflicts = getConflicts(cards, false);
    console.dir(conflicts.conflicting, { depth: null, color: true });
    console.log('Found ' + conflicts.conflictingCount + ' conflicts.');
}

main();