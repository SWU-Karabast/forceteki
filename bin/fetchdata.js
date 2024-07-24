/*eslint no-console:0 */
const { default: axios } = require('axios');
const { log } = require('console');
const fs = require('fs/promises');
const mkdirp = require('mkdirp');
const path = require('path');

const pathToJSON = path.join(__dirname, '../test/swu/json/');

function getAttributeNames(attributeList) {
    if (Array.isArray(attributeList.data)) {
        return attributeList.data.map((attr) => attr.attributes.name.toLowerCase());
    } else {
        return attributeList.data.attributes.name.toLowerCase();
    }
}

function filterValues(card) {
    // just filter out variants for now
    // TODO: add some map for variants
    if (card.attributes.variantOf.data != null)
    {
        return null;
    }

    filteredObj = (
        ({ title, subtitle, cost, hp, power, text, deployBox, epicAction, unique, rules }) => 
            ({ title, subtitle, cost, hp, power, text, deployBox, epicAction, unique, rules }))
        (card.attributes);

    filteredObj.id = card.attributes.cardId || card.attributes.cardUid;

    filteredObj.aspects = getAttributeNames(card.attributes.aspects);
    filteredObj.type = getAttributeNames(card.attributes.type);
    filteredObj.traits = getAttributeNames(card.attributes.traits);
    filteredObj.arena = getAttributeNames(card.attributes.arenas)[0];
    filteredObj.keywords = getAttributeNames(card.attributes.keywords);
    
    let internalName = filteredObj.title;
    if (filteredObj.subtitle) {
        internalName += "#" + filteredObj.subtitle;
    }
    filteredObj.internalName = internalName.toLowerCase().replace(/[^\w\s#]|_/g, "").replace(/\s/g, "-");

    // keep original card for debug logging, will be removed before card is written to file
    delete card.attributes.variants;
    filteredObj.debugObject = card;

    return filteredObj;
}

function getCardData(page) {
    return axios.get('https://admin.starwarsunlimited.com/api/cards?pagination[page]=' + page)
        .then(res => res.data.data)
        .then((cards) => {
            console.log(cards.length + ' cards fetched. on page ' + page);
            mkdirp.sync(pathToJSON);
            mkdirp.sync(path.join(pathToJSON, 'Card'));
            return Promise.all(
                cards.map((card) => {
                    let simplifiedCard = filterValues(card);
                    if (!simplifiedCard) {
                        return null;
                    }
                    return simplifiedCard;
                })
            );
        })
        .catch((error) => console.log('error fetching: ' + error));
}

async function main() {
    pageData = await axios.get('https://admin.starwarsunlimited.com/api/cards');
    totalPageCount = pageData.data.meta.pagination.pageCount;

    let cards = (await Promise.all([...Array(totalPageCount).keys()].map(pageNumber => getCardData(pageNumber + 1)))).flat();
    cards = cards.filter(n => n); // remove nulls

    var cardMap = [];
    var seenNames = [];
    var duplicatesWithSetCode = {};
    var uniqueCards = [];
    for (const card of cards) {
        if (seenNames.includes(card.internalName)) {
            if (duplicatesWithSetCode[card.internalName] == null) {
                duplicatesWithSetCode[card.internalName] = cards.filter(c => c.internalName === card.internalName)
                    .map(c => c.debugObject.attributes.expansion.data.attributes.code);
            }
            continue;
        }

        seenNames.push(card.internalName);
        cardMap.push({ id: card.id, internalName: card.internalName, title: card.title, subtitle: card.subtitle });
        uniqueCards.push(card);
    }

    cards.map(card => delete card.debugObject);

    if (duplicatesWithSetCode) {
        console.log(`Duplicate cards found, with set codes: ${JSON.stringify(duplicatesWithSetCode, null, 2)}`);
    }

    await Promise.all(uniqueCards.map(async (card) => fs.writeFile(path.join(pathToJSON, `Card/${card.internalName}.json`), JSON.stringify([card], null, 2))));

    fs.writeFile(path.join(pathToJSON, '_cardMap.json'), JSON.stringify(cardMap, null, 2))
}

main();
