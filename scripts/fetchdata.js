/* eslint no-console:0 */
const { default: axios } = require('axios');
const { default: axiosRetry } = require('axios-retry');
const { Agent } = require('https');
const fs = require('fs/promises');
const mkdirp = require('mkdirp');
const path = require('path');
const cliProgress = require('cli-progress');
const { addMockCards } = require('./mockdata');
const { computeCardDataHash } = require('./cardDataHash');

// ############################################################################
// #################                 IMPORTANT              ###################
// ############################################################################
// The CI card data cache key and local dev validation are based on a hash of
// card-data-version.txt, fetchdata.js, and mockdata.js. Changes to any of
// these files will automatically bust the cache. You can also manually
// update card-data-version.txt to force a cache bust if needed.

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

    // Bases trait
    switch (id) {
        case '2429341052': // Security Complex: Scarif
        case '4028826022': // Data Vault: Scarif
        case '5020758299': // Citadel Research Center: Scarif
            attributes.traits = {
                data: [{ attributes: { name: 'Scarif' } }]
            };
            break;
        case '6366665313': // Capital City: Lothal
        case '1393827469': // Tarkintown: Lothal
        case '7204128611': // Vergence Temple: Lothal
        case '7297371836': // Imperial Command Complex: Lothal
            attributes.traits = {
                data: [{ attributes: { name: 'Lothal' } }]
            };
            break;
        case '3810584393': // Dagobah Swamp: Dagobah
        case '9756609647': // Dragonsnake Bog: Dagobah
            attributes.traits = {
                data: [{ attributes: { name: 'Dagobah' } }]
            };
            break;
        case '0507674993': // Command Center: Death Star
        case '2012318453': // Emperor's Throne Room: Death Star
            attributes.traits = {
                data: [{ attributes: { name: 'Death Star' } }]
            };
            break;
        case '2055904747': // Echo Base: Hoth
        case '1049149674': // Echo Caverns: Hoth
        case '0479107180': // Forward Command Post: Hoth
            attributes.traits = {
                data: [{ attributes: { name: 'Hoth' } }]
            };
            break;
        case '8659924257': // Catacombs of Cadera: Jedha
        case '2569134232': // Jedha City: Jedha
        case '3380203065': // The Holy City: Jedha
            attributes.traits = {
                data: [{ attributes: { name: 'Jedha' } }]
            };
            break;
        case '0461841375': // Kestro City: Vardos
            attributes.traits = {
                data: [{ attributes: { name: 'Vardos' } }]
            };
            break;
        case '8129465864': // Administrator's Tower: Cloud City
        case '8909627038': // City in the Clouds: Cloud City
            attributes.traits = {
                data: [{ attributes: { name: 'Cloud City' } }]
            };
            break;
        case '3488958204': // Remnant Science Facility: Nevarro
        case '5662039114': // Nevarro City: Nevarro
        case '3973342702': // Nevarro City, Restored: Nevarro
            attributes.traits = {
                data: [{ attributes: { name: 'Nevarro' } }]
            };
            break;
        case '2403450809': // Remote Village: Sorgan
            attributes.traits = {
                data: [{ attributes: { name: 'Sorgan' } }]
            };
            break;
        case '4006047777': // Maz Kanata's Castle: Takodana
            attributes.traits = {
                data: [{ attributes: { name: 'Takodana' } }]
            };
            break;
        case '2547571983': // Death Watch Hideout: Concordia
            attributes.traits = {
                data: [{ attributes: { name: 'Concordia' } }]
            };
            break;
        case '6956298674': // Spice Mines: Kessel
        case '6862472986': // Coaxium Mine: Kessel
            attributes.traits = {
                data: [{ attributes: { name: 'Kessel' } }]
            };
            break;
        case '4313706014': // Coronet City: Corellia
            attributes.traits = {
                data: [{ attributes: { name: 'Corellia' } }]
            };
            break;
        case '6594935791': // Pau City: Utapau
            attributes.traits = {
                data: [{ attributes: { name: 'Utapau' } }]
            };
            break;
        case '9617095664': // Jabba's Palace: Tatooine
        case '4751899478': // Mos Eisley: Tatooine
        case '5043366366': // Daimyo's Palace: Tatooine
        case '7897278827': // Great Pit of Carkoon: Tatooine
        case '8082875787': // Freetown: Tatooine
            attributes.traits = {
                data: [{ attributes: { name: 'Tatooine' } }]
            };
            break;
        case '6672139274': // Sundari: Mandalore
        case '0344986336': // Sundari Palace: Mandalore
            attributes.traits = {
                data: [{ attributes: { name: 'Mandalore' } }]
            };
            break;
        case '7303722102': // The Crystal City: Christophsis
            attributes.traits = {
                data: [{ attributes: { name: 'Christophsis' } }]
            };
            break;
        case '8589863038': // Droid Manufactory: Geonosis
        case '9652861741': // Petranaki Arena: Geonosis
        case '1546304694': // Executioner's Arena: Geonosis
            attributes.traits = {
                data: [{ attributes: { name: 'Geonosis' } }]
            };
            break;
        case '7827173440': // Lair of Grievous: Vassek
            attributes.traits = {
                data: [{ attributes: { name: 'Vassek' } }]
            };
            break;
        case '0348855629': // Tipoca City: Kamino
            attributes.traits = {
                data: [{ attributes: { name: 'Kamino' } }]
            };
            break;
        case '6854189262': // Shadow Collective Camp: Zanbar
            attributes.traits = {
                data: [{ attributes: { name: 'Zanbar' } }]
            };
            break;
        case '0109520913': // KCM Mining Facility: Mustafar
        case '5396502974': // Fortress Vader: Mustafar
            attributes.traits = {
                data: [{ attributes: { name: 'Mustafar' } }]
            };
            break;
        case '3867306441': // The Nest: Onderon
            attributes.traits = {
                data: [{ attributes: { name: 'Onderon' } }]
            };
            break;
        case '1023625185': // Level 1313: Coruscant
        case '0119018087': // Shadowed Undercity: Coruscant
        case '0450346170': // Jedi Temple: Coruscant
        case '8273646709': // Uscru Entertainment District: Coruscant
        case '7504537867': // Senate Rotunda: Coruscant
        case '2696059415': // Naval Intelligence HQ: Coruscant
        case '4642946597': // Amnesty Housing: Coruscant
        case '1352374398': // First Battle Memorial: Coruscant
            attributes.traits = {
                data: [{ attributes: { name: 'Coruscant' } }]
            };
            break;
        case '2293075446': // Pyke Palace: Oba Diah
            attributes.traits = {
                data: [{ attributes: { name: 'Oba Diah' } }]
            };
            break;
        case '9014930596': // Shield Generator Complex: Endor
            attributes.traits = {
                data: [{ attributes: { name: 'Endor' } }]
            };
            break;
        case '1029978899': // Colossus: Castilon
            attributes.traits = {
                data: [{ attributes: { name: 'Castilon' } }]
            };
            break;
        case '7884329236': // Resistance Headquarters: D'Qar
            attributes.traits = {
                data: [{ attributes: { name: 'D\'Qar' } }]
            };
            break;
        case '1055085019': // Theed Palace: Naboo
        case '1672815328': // Lake Country: Naboo
            attributes.traits = {
                data: [{ attributes: { name: 'Naboo' } }]
            };
            break;
        case '4301437393': // Thermal Oscillator: Starkiller Base
            attributes.traits = {
                data: [{ attributes: { name: 'Starkiller Base' } }]
            };
            break;
        case '7720892024': // Massassi Temple: Yavin 4
            attributes.traits = {
                data: [{ attributes: { name: 'Yavin 4' } }]
            };
            break;
        case '0547032058': // Nadiri Dockyards: Nadiri
            attributes.traits = {
                data: [{ attributes: { name: 'Nadiri' } }]
            };
            break;
        case '9586661707': // Nabat Village: Ryloth
            attributes.traits = {
                data: [{ attributes: { name: 'Ryloth' } }]
            };
            break;
        case '6093792814': // Chopper Base: Atollon
            attributes.traits = {
                data: [{ attributes: { name: 'Atollon' } }]
            };
            break;
        case '2098652813': // Nightsister Lair: Dathomir
        case '8710346686': // Strangled Cliffs: Dathomir
            attributes.traits = {
                data: [{ attributes: { name: 'Dathomir' } }]
            };
            break;
        case '9434212852': // Mystic Monastery: Mortis
            attributes.traits = {
                data: [{ attributes: { name: 'Mortis' } }]
            };
            break;
        case '2945340801': // Starlight Temple: Starlight Beacon
            attributes.traits = {
                data: [{ attributes: { name: 'Starlight Beacon' } }]
            };
            break;
        case '9453163990': // Temple of Destruction: Malachor
            attributes.traits = {
                data: [{ attributes: { name: 'Malachor' } }]
            };
            break;
        case '2699176260': // Tomb of Eilram: Zeffo
            attributes.traits = {
                data: [{ attributes: { name: 'Zeffo' } }]
            };
            break;
        case '4352576521': // Crystal Caves: Ilum
            attributes.traits = {
                data: [{ attributes: { name: 'Ilum' } }]
            };
            break;
        case '7978556886': // Rix Road: Ferrix
            attributes.traits = {
                data: [{ attributes: { name: 'Ferrix' } }]
            };
            break;
        case '7790300585': // Republic City: Hosnian Prime
            attributes.traits = {
                data: [{ attributes: { name: 'Hosnian Prime' } }]
            };
            break;
        case '4286542404': // Imperial Prison Complex: Narkina 5
            attributes.traits = {
                data: [{ attributes: { name: 'Narkina 5' } }]
            };
            break;
        case '2376813177': // Mount Tantiss: Wayland
            attributes.traits = {
                data: [{ attributes: { name: 'Wayland' } }]
            };
            break;
        case '3469239154': // Alliance Outpost: Lowick
            attributes.traits = {
                data: [{ attributes: { name: 'Lowick' } }]
            };
            break;
        case '2248996839': // Aldhani Garrison: Aldhani
            attributes.traits = {
                data: [{ attributes: { name: 'Aldhani' } }]
            };
            break;
        case '0121172430': // Contested Caverns: Quarzite
            attributes.traits = {
                data: [{ attributes: { name: 'Quarzite' } }]
            };
            break;
        case '2034527101': // Shipbreaking Yard: Bracca
            attributes.traits = {
                data: [{ attributes: { name: 'Bracca' } }]
            };
            break;
        case '5020919647': // Stygeon Spire: Stygeon Prime
            attributes.traits = {
                data: [{ attributes: { name: 'Stygeon Prime' } }]
            };
            break;
        case '2937103129': // Canto Bight: Cantonica
            attributes.traits = {
                data: [{ attributes: { name: 'Cantonica' } }]
            };
            break;
        case '1156889063': // Partisan Hideout: Segra Milo
            attributes.traits = {
                data: [{ attributes: { name: 'Segra Milo' } }]
            };
            break;
        case '4631699773': // Dooku's Palace: Serenno
            attributes.traits = {
                data: [{ attributes: { name: 'Serrenno' } }]
            };
            break;
        case '7349221421': // Fortress of the Great Mothers: Peridea
            attributes.traits = {
                data: [{ attributes: { name: 'Peridea' } }]
            };
            break;
        case '9742372393': // Kryze Castle: Kalevala
            attributes.traits = {
                data: [{ attributes: { name: 'Kalevala' } }]
            };
            break;
        case '5672134899': // Ancient Henge: Seatos
            attributes.traits = {
                data: [{ attributes: { name: 'Seatos' } }]
            };
            break;
        case '6815244860': // Emperor's Observatory: Pillio
            attributes.traits = {
                data: [{ attributes: { name: 'Pillio' } }]
            };
            break;
        case '8327910265': // Energy Conversion Lab: Eadu
            attributes.traits = {
                data: [{ attributes: { name: 'Eadu' } }]
            };
            break;
    }
}

const promoPrefixes = ['C', 'G', 'J', 'P', 'MV'];
const promoRegex = new RegExp(`^(${promoPrefixes.join('|')})\\d\\d$`);

function isPromoSetCode(setCode) {
    // Promos/Convention Exclusives - e.g., 'C24', 'P25', 'MV25'
    if (promoRegex.test(setCode)) {
        return true;
    }
    // Gamegenic promo bases
    if (setCode === 'GG') {
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

        if (card.attributes.backSideAspects) {
            filteredObj.backSideAspects = getAttributeNames(card.attributes.backSideAspects);
        }
        if (card.attributes.backSideTitle) {
            filteredObj.backSideTitle = card.attributes.backSideTitle;
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
        console.error('WARNING: error parsing card data, card omitted');
        console.error(error);
        console.error('\n\n');
        return null;
    }
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
            console.error(error);
            throw new Error(`Request error retrieving data: ${error}`);
        });
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
        ['ASH', 8]
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

    let downloadedCards = (await Promise.all([...Array(totalPageCount).keys()]
        .map((pageNumber) => getCardData(pageNumber + 1, downloadProgressBar))))
        .flat()
        .filter((n) => n); // remove nulls

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

    downloadProgressBar.stop();

    const { uniqueCards, cardMap, allNonLeaderCardTitles, playableCardTitles, setCodeMap, leaderNames } = buildCardLists(cards);

    cards.map((card) => delete card.debugObject);

    console.log('\nwriting card definition files');
    const fileWriteProgressBar = new cliProgress.SingleBar({ format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total}' });
    fileWriteProgressBar.start(uniqueCards.length, 0);

    await Promise.all(uniqueCards.map((card) => {
        fs.writeFile(path.join(pathToJSON, `Card/${card.internalName}.json`), JSON.stringify(card, null, 2));
        fileWriteProgressBar.increment();
    }));

    fileWriteProgressBar.stop();

    fs.writeFile(path.join(pathToJSON, '_cardMap.json'), JSON.stringify(cardMap, null, 2));
    fs.writeFile(path.join(pathToJSON, '_allNonLeaderCardTitles.json'), JSON.stringify(allNonLeaderCardTitles, null, 2));
    fs.writeFile(path.join(pathToJSON, '_playableCardTitles.json'), JSON.stringify(playableCardTitles, null, 2));
    fs.writeFile(path.join(pathToJSON, '_setCodeMap.json'), JSON.stringify(setCodeMap, null, 2));
    fs.writeFile(path.join(pathToJSON, '_mockCardNames.json'), JSON.stringify(mockCardNames, null, 2));
    fs.writeFile(path.join(pathToJSON, '_leaderNames.json'), JSON.stringify(leaderNames, null, 2));
    fs.writeFile(path.join(pathToJSON, 'card-data-hash.txt'), computeCardDataHash());

    console.log(`\n${uniqueCards.length} card definition files downloaded to ${pathToJSON}`);
}

main();
