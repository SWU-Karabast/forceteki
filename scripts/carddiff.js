/* eslint no-console:0 */
const { default: axios } = require('axios');
const { default: axiosRetry } = require('axios-retry');
const { Agent } = require('https');
const { log } = require('console');

function getConflicts(cards, flag = true) {
    if (cards.length > 0) {
        var verified = {};
        var verifiedData = {};
        var verifiedResults = {
            matching: {},
            conflicting: {},
            matchingCount: 0,
            conflictingCount: 0
        };
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i].attributes;
            const cardIdentifier = card.title.toUpperCase() + (card.subtitle !== null && card.subtitle !== '' ? ' - ' + card.subtitle.toUpperCase() : '');

            if (!(cardIdentifier in verified)) {
                verified[cardIdentifier] = {};
            }

            verified[cardIdentifier][card.cardUid] = {
                title: card.title,
                subtitle: card.subtitle || "",
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

            var countMatching = 0;
            if (Object.keys(verifiedData[cardKey].title).length === 1) {
                verifiedData[cardKey].title = Object.keys(verifiedData[cardKey].title)[0];
                countMatching++;
            }
            if (Object.keys(verifiedData[cardKey].subtitle).length === 1) {
                verifiedData[cardKey].subtitle = Object.keys(verifiedData[cardKey].subtitle)[0];
                countMatching++;
            }
            if (Object.keys(verifiedData[cardKey].arenas).length === 1) {
                verifiedData[cardKey].arenas = Object.keys(verifiedData[cardKey].arenas)[0];
                countMatching++;
            }
            if (Object.keys(verifiedData[cardKey].aspects).length === 1) {
                verifiedData[cardKey].aspects = Object.keys(verifiedData[cardKey].aspects)[0];
                countMatching++;
            }
            if (Object.keys(verifiedData[cardKey].cost).length === 1) {
                verifiedData[cardKey].cost = Object.keys(verifiedData[cardKey].cost)[0];
                countMatching++;
            }
            if (Object.keys(verifiedData[cardKey].hp).length === 1) {
                verifiedData[cardKey].hp = Object.keys(verifiedData[cardKey].hp)[0];
                countMatching++;
            }
            if (Object.keys(verifiedData[cardKey].keywords).length === 1) {
                verifiedData[cardKey].keywords = Object.keys(verifiedData[cardKey].keywords)[0];
                countMatching++;
            }
            if (Object.keys(verifiedData[cardKey].power).length === 1) {
                verifiedData[cardKey].power = Object.keys(verifiedData[cardKey].power)[0];
                countMatching++;
            }
            if (Object.keys(verifiedData[cardKey].traits).length === 1) {
                verifiedData[cardKey].traits = Object.keys(verifiedData[cardKey].traits)[0];
                countMatching++;
            }
            if (Object.keys(verifiedData[cardKey].types).length === 1) {
                verifiedData[cardKey].types = Object.keys(verifiedData[cardKey].types)[0];
                countMatching++;
            }
            if (Object.keys(verifiedData[cardKey].unique).length === 1) {
                verifiedData[cardKey].unique = Object.keys(verifiedData[cardKey].unique)[0];
                countMatching++;
            }
            if (Object.keys(verifiedData[cardKey].upgradeHp).length === 1) {
                verifiedData[cardKey].upgradeHp = Object.keys(verifiedData[cardKey].upgradeHp)[0];
                countMatching++;
            }
            if (Object.keys(verifiedData[cardKey].upgradePower).length === 1) {
                verifiedData[cardKey].upgradePower = Object.keys(verifiedData[cardKey].upgradePower)[0];
                countMatching++;
            }

            if (countMatching === 13) {
                verifiedResults.matching[cardKey] = verifiedData[cardKey];
                verifiedResults.matchingCount++;
            } else {
                verifiedResults.conflicting[cardKey] = verifiedData[cardKey];
                verifiedResults.conflictingCount++;
            }
        }
        if (flag) {
            if (verifiedResults.conflictingCount > 0) {
                console.log('Found some conflicts. Run `npm run card-diff` to see the specifics.');
            }
            return (verifiedResults.conflictingCount > 0);
        } else {
            return verifiedResults;
        }
    }
    console.log('No cards found.');
}

async function main() {
    axios.defaults.httpAgent = new Agent({
        maxSockets: 8,
    });
    axios.defaults.httpsAgent = new Agent({
        maxSockets: 8,
    });

    const apiUrl = 'https://admin.starwarsunlimited.com/api/cards';
    const pageResponse = await axios.get(apiUrl);
    const totalPages = pageResponse.data.meta.pagination.pageCount;

    var cards = [];
    if (totalPages > 0) {
        try {
            cards = (await Promise.all([...Array(totalPages).keys()].map(i => axios.get(apiUrl + '?pagination[page]=' + (i + 1)).then(res => res.data.data)))).flat();
        } catch (error) {
            console.error('Error getting card data:', error);
        }            
    }

    const conflicts = getConflicts(cards, false);
    console.dir(conflicts.conflicting, { depth: null, color: true });
    console.log('Found ' + conflicts.conflictingCount + ' conflicts.');
}

main();