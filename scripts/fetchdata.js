/* eslint no-console:0 */
const { default: axios } = require('axios');
const { default: axiosRetry } = require('axios-retry');
const { Agent } = require('https');
const fs = require('fs/promises');
const path = require('path');
const cliProgress = require('cli-progress');
const { addMockCards } = require('./mockdata');
const { computeCardDataHash } = require('./cardDataHash');
const { populateBaseTraits } = require('./baseTraits');

// ############################################################################
// #################                 IMPORTANT              ###################
// ############################################################################
// The CI card data cache key and local dev validation are based on a hash of
// card-data-version.txt, fetchdata.js, and mockdata.js. Changes to any of
// these files will automatically bust the cache. You can also manually
// update card-data-version.txt to force a cache bust if needed.

const pathToJSON = path.join(__dirname, '../test/json/');
const cacheVersion = 1;
const fullRefreshInterval = 7 * 24 * 60 * 60 * 1000;
// The CDN caches responses for an hour. Overlap syncs to include updates hidden by an older response.
const syncOverlap = 2 * 60 * 60 * 1000;

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
        case '5844562972': // advantage
            attributes.upgradeHp = 0;
            attributes.upgradePower = 1;
            break;
        case '8015500527': // Credit token
        case '4571900905': // The Force
            attributes.cost = 0;
            attributes.type = {
                data: {
                    attributes: {
                        name: 'token'
                    }
                }
            };
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
            attributes.backSideTraits = {
                data: [{ attributes: {
                    name: 'Force'
                } },
                { attributes: {
                    name: 'Separatist'
                } },
                { attributes: {
                    name: 'Sith'
                } },
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
        case '1535458352': // Grand Moff Tarkin - Tyrant of the Outer Rim (HMW)
            // Official data does not include the deployed leader-unit side's identity ("The Death Star").
            attributes.backSideTitle = 'The Death Star';
            attributes.backSideSubtitle = 'Icon of Tyranny';
            attributes.backSideTraits = {
                data: [
                    { attributes: { name: 'Imperial' } },
                    { attributes: { name: 'Vehicle' } },
                    { attributes: { name: 'Capital Ship' } },
                ]
            };
            break;
        case '8862896760': // Maul - Shadow Collective Visionary
            attributes.text = 'Ambush\nOverwhelm\nOn Attack: You may choose another friendly Underworld unit. If you do, all combat damage that would be dealt to this unit during this attack is dealt to the chosen unit instead.';
            break;
        case '0011262813': // Wedge Antilles - Leader of Red Squadron
            attributes.keywords = {
                data: []
            };
            break;
        case '5683908835': // Count Dooku - Face of the Confederacy
            attributes.keywords = {
                data: [{
                    attributes: {
                        name: 'Overwhelm'
                    }
                },
                {
                    attributes: {
                        name: 'Exploit'
                    }
                }]
            };
            break;
        case '0754286363': // The Mandalorian's Rifle
            attributes.unique = true;
            break;
        case '6190335038': // Aayla Secura - Master of the Blade
            attributes.traits = {
                data: [{ attributes: {
                    name: 'Force'
                } },
                { attributes: {
                    name: 'Jedi'
                } },
                { attributes: {
                    name: 'Republic'
                } },
                { attributes: {
                    name: 'Twi\'lek'
                } },
                ]
            };
            break;
        case '6658095148': // Zeb Orrelios - Spectre Four
        case '2157679168':
            attributes.title = 'Zeb Orrelios'; // Fix spelling
            break;
        case '9349017358':
            attributes.title = 'C-3PO';
            break;
        case '6565211534': // Mayor's Majordomo - No Problem Groveling (errata: add Twi'lek trait)
            attributes.traits = {
                data: [{ attributes: {
                    name: 'Official'
                } },
                { attributes: {
                    name: 'Twi\'lek'
                } },
                ]
            };
            break;
    }

    // Plot cards from Secrets of Power
    switch (id) {
        case '3796991604': // Dogmatic Shock Squad
            attributes.keywords = {
                data: [
                    {
                        attributes: { name: 'Plot' }
                    },
                    {
                        attributes: { name: 'Sentinel' }
                    },
                ]
            };
            break;
        case '8826807979': // Dressellian Commandos
        case '7394847809': // First Light
            attributes.keywords = {
                data: [
                    {
                        attributes: { name: 'Plot' }
                    },
                    {
                        attributes: { name: 'Ambush' }
                    },
                ]
            };
            break;
        case '7069246970': // Sly Moore
        case '8365930807': // Cad Bane
        case '3612601170': // One In a Million
        case '0024944513': // Armor of Fortune
        case '7936097828': // Chancellor Palpatine
        case '7365023470': // Mas Amedda
        case '2919204327': // Naboo Royal Starship
        case '9985741271': // Jar Jar Binks
        case '2877797132': // Unveiled Might
        case '3776423866': // Trade Route Taxation
        case '8845103653': // Hondo Ohnaka
        case '0602708575': // Kaydel Connix
        case '7482343383': // Cinta Kaz
        case '2785395871': // Sudden Ferocity
        case '8401985446': // Topple the Summit
        case '1369084772': // Tala Durith
        case '6015383018': // Sneaking Suspicion
        case '8796918121': // The Wrong Ride
        case '7248761207': // FN Trooper Corps
        case '5736131351': // Fully Armed and Operational
        case '2276001210': // Garindan
        case '1970175552': // Vigil
        case '2792329893': // Galen Erso
        case '3206848209': // Remote Escort Tank
        case '1501441701': // Strike Force X-Wing
        case '9755584844': // Lurking Snub Fighter
            attributes.keywords = {
                data: [{
                    attributes: {
                        name: 'Plot'
                    }
                }]
            };
            break;
    }

    // HMW reprints
    switch (id) {
        case '9014930596': // Shield Generator Complex
            attributes.reprints = {
                data: [{
                    attributes: {
                        expansion: { data: { attributes: { code: 'HMW' } } },
                        cardNumber: 22
                    }
                }]
            };
            break;
        case '1055085019': // Theed Palace
            attributes.reprints = {
                data: [{
                    attributes: {
                        expansion: { data: { attributes: { code: 'HMW' } } },
                        cardNumber: 25
                    }
                }]
            };
            break;
        case '4751899478': // Mos Eisley
            attributes.reprints = {
                data: [{
                    attributes: {
                        expansion: { data: { attributes: { code: 'HMW' } } },
                        cardNumber: 32
                    }
                }]
            };
            break;
    }

    // Bases trait
    populateBaseTraits(attributes, id);
}

const promoPrefixes = ['C', 'G', 'J', 'P', 'MV'];
const promoRegex = new RegExp(`^(${promoPrefixes.join('|')})\\d\\d$`);

function isPromoSetCode(setCode) {
    // Promos/Convention Exclusives - e.g., 'C24', 'P25', 'MV25'
    if (promoRegex.test(setCode)) {
        return true;
    }
    // Gamegenic promo bases and Costco exclusives
    if (setCode === 'GG' || setCode === 'CST') {
        return true;
    }
    // OP Promos (codes that are 4 or 5 characters and end in P or OP)
    if ((/^\w{2,3}O?P$/).test(setCode)) {
        return true;
    }
    return false;
}

function getAttributeNames(attributeList) {
    if (Array.isArray(attributeList.data)) {
        return attributeList.data.map((attr) => attr.attributes.name.toLowerCase());
    }

    return attributeList.data.attributes.name.toLowerCase();
}

function buildSetCodeList(card) {
    if (!card.reprints || !card.reprints.data || card.reprints.data.length === 0) {
        return [card.setId];
    }

    const reprintSetIds = card.reprints.data
        .map((reprint) => {
            return {
                set: reprint.attributes.expansion.data.attributes.code,
                number: reprint.attributes.cardNumber
            };
        })
        .filter((setId) => !isPromoSetCode(setId.set));

    return [card.setId].concat(reprintSetIds);
}

function makeSetCodeString(setCode) {
    return `${setCode.set}_${String(setCode.number).padStart(3, '0')}`;
}

function filterValues(card) {
    try {
        // just filter out variants for now
        // TODO: add some map for variants
        if (card.attributes.variantOf.data !== null) {
            return null;
        }

        if (isPromoSetCode(card.attributes.expansion.data.attributes.code)) {
            return null;
        }

        const id = card.attributes.cardId || card.attributes.cardUid;
        populateMissingData(card.attributes, id);

        // hacky way to strip the object down to just the attributes we want
        const filterAttributes = ({ title, backSideTitle, subtitle, cost, hp, power, text, deployBox, epicAction, unique, rules, reprints, upgradePower, upgradeHp }) =>
            ({ title, backSideTitle, subtitle, cost, hp, power, text, deployBox, epicAction, unique, rules, reprints, upgradePower, upgradeHp });

        let filteredObj = filterAttributes(card.attributes);

        filteredObj.id = id;

        filteredObj.text = card.attributes.text;

        if (card.attributes.hp === null && card.attributes.upgradeHp != null) {
            filteredObj.hp = card.attributes.upgradeHp;
        }

        if (card.attributes.power === null && card.attributes.upgradePower != null) {
            filteredObj.power = card.attributes.upgradePower;
        }

        filteredObj.aspects = getAttributeNames(card.attributes.aspects).concat(getAttributeNames(card.attributes.aspectDuplicates));
        filteredObj.traits = getAttributeNames(card.attributes.traits);
        filteredObj.arena = getAttributeNames(card.attributes.arenas)[0];
        filteredObj.keywords = getAttributeNames(card.attributes.keywords);

        // Fortify upgrades attach to a base and have no power/HP modifier. The official data omits
        // these values (null), but the engine requires numeric upgrade stats. Default them (and the
        // derived power/HP) to 0, matching how other stat-less upgrades and tokens are handled.
        if (filteredObj.keywords.includes('fortify')) {
            filteredObj.upgradeHp = filteredObj.upgradeHp ?? 0;
            filteredObj.upgradePower = filteredObj.upgradePower ?? 0;
            filteredObj.hp = filteredObj.hp ?? 0;
            filteredObj.power = filteredObj.power ?? 0;
        }

        if (card.attributes.backSideAspects) {
            filteredObj.backSideAspects = getAttributeNames(card.attributes.backSideAspects);
        }
        if (card.attributes.backSideTitle) {
            filteredObj.backSideTitle = card.attributes.backSideTitle;
        }
        if (card.attributes.backSideSubtitle) {
            filteredObj.backSideSubtitle = card.attributes.backSideSubtitle;
        }
        if (card.attributes.backSideTraits) {
            filteredObj.backSideTraits = getAttributeNames(card.attributes.backSideTraits);
        }

        // if a card has multiple types it will be still in one string, like 'token upgrade'
        filteredObj.types = getAttributeNames(card.attributes.type).split(' ');

        filteredObj.setId = { set: card.attributes.expansion.data.attributes.code };

        // tokens use a different numbering scheme, can ignore for now
        if (!filteredObj.types.includes('token')) {
            filteredObj.setId.number = card.attributes.cardNumber;
            filteredObj.setCodes = buildSetCodeList(filteredObj);
        }

        // Reprint data no longer needed
        delete filteredObj.reprints;

        if (filteredObj.keywords.includes('piloting')) {
            filteredObj.pilotText = filteredObj.epicAction;
            filteredObj.epicAction = null;
        }

        let internalName = filteredObj.title;
        internalName += filteredObj.subtitle ? '#' + filteredObj.subtitle : '';
        // remove accents / diacritics (e.g., 'Chirrut Îmwe' -> 'Chirrut Imwe')
        internalName = internalName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        filteredObj.internalName = internalName.toLowerCase().replace(/[^\w\s#]|_/g, '')
            .replace(/\s/g, '-');

        // Ensure all card titles with quotes use the same type of quote character (e.g., 'Benthic "Two Tubes"' instead of 'Benthic “Two Tubes”')
        filteredObj.title = filteredObj.title
            .replace(/“|”/g, '"')
            .replace(/‘|’/g, '\'');

        // keep original card for debug logging, will be removed before card is written to file
        delete card.attributes.variants;
        filteredObj.debugObject = card;

        return filteredObj;
    } catch (error) {
        throw new Error(`Error parsing card data for API record ${card.id}`, { cause: error });
    }
}

function isUsableCache(cache, now) {
    return cache?.version === cacheVersion &&
      Number.isFinite(cache.syncedAt) && cache.syncedAt <= now &&
      Number.isFinite(cache.fullRefreshAt) && cache.fullRefreshAt <= cache.syncedAt &&
      Array.isArray(cache.cards) && cache.cards.length > 0 &&
      cache.cards.every((card) => Number.isInteger(card?.id) &&
        Number.isFinite(Date.parse(card.attributes?.updatedAt)) &&
        card.attributes.variantOf?.data === null &&
        typeof card.attributes.expansion?.data?.attributes?.code === 'string');
}

async function readCardCache(cachePath) {
    try {
        return JSON.parse(await fs.readFile(cachePath, 'utf8'));
    } catch (error) {
        if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) {
            throw error;
        }
        return null;
    }
}

function requestCardPage(params) {
    return axios.get(`https://admin.starwarsunlimited.com/api/cards?${new URLSearchParams(params)}`, {
        timeout: 60000,
    });
}

async function syncCardData({ cache = null, force = false, now = Date.now(), request = requestCardPage, onProgress = () => {} } = {}) {
    const fullRefresh = force || !isUsableCache(cache, now) || now - cache.fullRefreshAt >= fullRefreshInterval;
    const params = { 'pagination[pageSize]': '100', 'sort[0]': 'id:asc' };
    if (fullRefresh) {
        params['filters[variantOf][id][$null]'] = 'true';
    } else {
        // Do not filter variants here: a previously cached card may have become a variant.
        params['filters[updatedAt][$gte]'] = new Date(cache.syncedAt - syncOverlap).toISOString();
    }

    const first = await request({ ...params, 'pagination[page]': '1' });
    const pagination = first.data?.meta?.pagination;
    if (!pagination || !Number.isInteger(pagination.pageCount) || pagination.pageCount < 0 ||
      !Number.isInteger(pagination.total) || pagination.total < 0 || !Array.isArray(first.data.data)) {
        throw new Error('Invalid card API pagination response');
    }
    const fetched = [...first.data.data];
    let completed = 1;
    onProgress(completed, Math.max(1, pagination.pageCount));
    for (let page = 2; page <= pagination.pageCount; page += 8) {
        const pages = Array.from({ length: Math.min(8, pagination.pageCount - page + 1) }, (_, index) => page + index);
        const results = await Promise.all(pages.map(async (pageNumber) => {
            const response = await request({ ...params, 'pagination[page]': String(pageNumber) });
            if (response.data?.meta?.pagination?.total !== pagination.total ||
              response.data.meta.pagination.pageCount !== pagination.pageCount || !Array.isArray(response.data.data)) {
                throw new Error('Card catalog changed during download; rerun get-cards');
            }
            onProgress(++completed, pagination.pageCount);
            return response.data.data;
        }));
        fetched.push(...results.flat());
    }
    if (fetched.length !== pagination.total || new Set(fetched.map((card) => card.id)).size !== fetched.length) {
        throw new Error('Incomplete or duplicate card API results; rerun get-cards');
    }
    if (fullRefresh && fetched.length === 0) {
        throw new Error('Card API returned an empty catalog; keeping existing card data');
    }

    const cardsById = new Map((fullRefresh ? [] : cache.cards).map((card) => [card.id, card]));
    for (const card of fetched) {
        if (!Number.isInteger(card.id) || !Number.isFinite(Date.parse(card.attributes?.updatedAt)) ||
          !card.attributes.variantOf || !card.attributes.expansion?.data?.attributes?.code) {
            throw new Error('Invalid card API record');
        }
        const existing = cardsById.get(card.id);
        if (existing && Date.parse(existing.attributes.updatedAt) > Date.parse(card.attributes.updatedAt)) {
            // A stale CDN response must not overwrite a newer record already in the cache.
            continue;
        }
        if (card.attributes.variantOf.data !== null || isPromoSetCode(card.attributes.expansion.data.attributes.code)) {
            cardsById.delete(card.id);
            continue;
        }
        const attributes = { ...card.attributes };
        // Keep source game data, not the large image/variant payloads that the API always populates.
        for (const key of ['artFront', 'artBack', 'artThumbnail', 'variants', 'localizations']) {
            delete attributes[key];
        }
        cardsById.set(card.id, { id: card.id, attributes });
    }

    // Use the response's age as well as the local start time, so cached responses cannot advance the cursor too far.
    const responseTime = Date.parse(first.headers?.date);
    const syncedAt = Number.isFinite(responseTime) ? Math.min(now, responseTime) : now;
    return {
        cache: {
            version: cacheVersion,
            syncedAt,
            fullRefreshAt: fullRefresh ? syncedAt : cache.fullRefreshAt,
            cards: [...cardsById.values()].sort((a, b) => a.id - b.id),
        },
        fullRefresh,
        fetchedCount: fetched.length,
    };
}

function buildCardLists(cards) {
    const cardMap = [];
    const setCodeMap = {};
    const allNonLeaderCardTitlesSet = new Set();
    const playableCardTitlesSet = new Set();
    const seenNames = [];
    const leaderNames = [];
    const uniqueCardsMap = new Map();
    const setNumber = new Map([
        ['SOR', 1],
        ['SHD', 2],
        ['TWI', 3],
        ['JTL', 4],
        ['LOF', 5],
        ['IBH', 5.9],
        ['SEC', 6],
        ['LAW', 7],
        ['TS26', 7.5],
        ['ASH', 8],
        ['HMW', 9],
        ['IC27', 9.5]
    ]);

    for (const card of cards) {
        if (seenNames.includes(card.internalName)) {
            // We already have this card, add its set code to the existing entry (if needed) then skip it
            const existingCard = uniqueCardsMap.get(card.internalName);
            const thisSetCode = card.setId;

            if (existingCard.setCodes) { // Should always be true except for tokens
                if (
                    setNumber.has(thisSetCode.set) && // Skip if this is not in a core set
                    !existingCard.setCodes.find((sc) => // Only add it if we don't already have this set code
                        sc.set === thisSetCode.set &&
                        sc.number === thisSetCode.number
                    )
                ) {
                    // This currently only picks up the duplicate cards within IBH
                    // (e.g. rogue-squadron-speeder is IBH_004, IBH_017, and IBH_034)
                    existingCard.setCodes.push(thisSetCode);
                    setCodeMap[makeSetCodeString(thisSetCode)] = existingCard.id;
                }
            }

            continue;
        }

        // creates a map of set code + card number to card id
        if (!card.types.includes('token')) {
            const setCodeStr = makeSetCodeString(card.setId);

            if (!setCodeMap.hasOwnProperty(setCodeStr)) {
                setCodeMap[setCodeStr] = card.id;
            }

            let mostRecentSetCode = card.setId;

            for (const setCode of card.setCodes) {
                if (setNumber.has(setCode.set)) {
                    setCodeMap[makeSetCodeString(setCode)] = card.id;
                    mostRecentSetCode = setCode;
                }
            }

            card.setId = mostRecentSetCode;
        }

        seenNames.push(card.internalName);
        cardMap.push({ id: card.id, internalName: card.internalName, title: card.title, subtitle: card.subtitle, cost: card.cost });

        if (!card.types.includes('leader')) {
            allNonLeaderCardTitlesSet.add(card.title);

            if (!card.types.includes('token') && !card.types.includes('base')) {
                playableCardTitlesSet.add(card.title);
            }
        }

        uniqueCardsMap.set(card.internalName, card);

        if (card.types.includes('leader')) {
            const cardId = `${card.setId.set}_${String(card.setId.number).padStart(3, '0')}`;
            leaderNames.push({ name: card.title, id: cardId, subtitle: card.subtitle });
        }
    }

    const allNonLeaderCardTitles = Array.from(allNonLeaderCardTitlesSet);
    allNonLeaderCardTitles.sort();

    const playableCardTitles = Array.from(playableCardTitlesSet);
    playableCardTitles.sort();

    const uniqueCards = [...uniqueCardsMap].map(([internalName, card]) => card);
    return { uniqueCards, cardMap, allNonLeaderCardTitles, playableCardTitles, setCodeMap, leaderNames };
}

async function main({ outputDir = pathToJSON, force = false, request = requestCardPage } = {}) {
    const startedAt = Date.now();
    axios.defaults.httpsAgent = new Agent({
        maxSockets: 8,
    });

    const cachePath = path.join(outputDir, '_sourceCardCache.json');
    const cache = await readCardCache(cachePath);
    console.log('checking for card updates (full refresh on first run, weekly, or with --force)');
    const downloadProgressBar = new cliProgress.SingleBar({ format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total}' });
    downloadProgressBar.start(1, 0);
    let result;
    try {
        result = await syncCardData({ cache, force, request, onProgress: (value, total) => {
            downloadProgressBar.setTotal(total);
            downloadProgressBar.update(value);
            if (!process.stdout.isTTY && (value === 1 || value % 8 === 0 || value === total)) {
                console.log(`Downloaded ${value}/${total} API pages`);
            }
        } });
    } finally {
        downloadProgressBar.stop();
    }
    console.log(`${result.fullRefresh ? 'Full refresh' : 'Incremental refresh'}: fetched ${result.fetchedCount} records; ${result.cache.cards.length} cards in source cache`);

    // Transform a copy: fixes and mock data must never mutate the cached API source records.
    const downloadedCards = structuredClone(result.cache.cards).map(filterValues)
        .filter((card) => card);

    const tokenCards = [];
    const downloadedNonTokenCards = [];
    for (const card of downloadedCards) {
        if (card.types.includes('token')) {
            tokenCards.push(card);
        } else {
            downloadedNonTokenCards.push(card);
        }
    }

    // cards = cards.concat([cunningForceBase, aggressionForceBase]);
    let { mockCardNames, cards } = addMockCards(downloadedNonTokenCards);
    cards = cards.concat(tokenCards);

    const { uniqueCards, cardMap, allNonLeaderCardTitles, playableCardTitles, setCodeMap, leaderNames } = buildCardLists(cards);

    // Validate that all bases have traits
    const basesWithoutTraits = uniqueCards.filter((card) => card.types.includes('base') && (!card.traits || card.traits.length === 0));
    if (basesWithoutTraits.length > 0) {
        console.error('\nERROR: The following bases are missing traits:');
        for (const base of basesWithoutTraits) {
            console.error(`  - ${base.title} (${makeSetCodeString(base.setId)})`);
        }
        throw new Error('Bases are missing traits. Please add traits to these bases (mockdata.js if it is a mock card, or baseTraits.js if it is a released card).');
    }

    cards.map((card) => delete card.debugObject);

    console.log('\nwriting card definition files');
    const fileWriteProgressBar = new cliProgress.SingleBar({ format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total}' });
    fileWriteProgressBar.start(uniqueCards.length, 0);

    const cardDir = path.join(outputDir, 'Card');
    await fs.mkdir(cardDir, { recursive: true });
    // A failed write must not leave a hash claiming that the generated data is complete.
    await fs.rm(path.join(outputDir, 'card-data-hash.txt'), { force: true });
    await Promise.all(uniqueCards.map(async (card) => {
        await fs.writeFile(path.join(cardDir, `${card.internalName}.json`), JSON.stringify(card, null, 2));
        fileWriteProgressBar.increment();
    }));

    fileWriteProgressBar.stop();

    const filenames = new Set(uniqueCards.map((card) => `${card.internalName}.json`));
    for (const filename of await fs.readdir(cardDir)) {
        if (filename.endsWith('.json') && !filenames.has(filename)) {
            await fs.unlink(path.join(cardDir, filename));
        }
    }
    const lists = { _cardMap: cardMap, _allNonLeaderCardTitles: allNonLeaderCardTitles, _playableCardTitles: playableCardTitles,
        _setCodeMap: setCodeMap, _mockCardNames: mockCardNames, _leaderNames: leaderNames };
    await Promise.all(Object.entries(lists).map(([name, value]) => fs.writeFile(path.join(outputDir, `${name}.json`), JSON.stringify(value, null, 2))));
    await fs.writeFile(`${cachePath}.tmp`, JSON.stringify(result.cache));
    await fs.rename(`${cachePath}.tmp`, cachePath);
    await fs.writeFile(path.join(outputDir, 'card-data-hash.txt'), computeCardDataHash());

    console.log(`\n${uniqueCards.length} card definition files generated in ${outputDir} in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);
}

if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.some((arg) => arg !== '--force')) {
        console.error('Usage: npm run get-cards -- [--force]');
        process.exitCode = 1;
    } else {
        main({ force: args.includes('--force') }).catch((error) => {
            console.error(error);
            process.exitCode = 1;
        });
    }
}

module.exports = { syncCardData, main };
