const { color } = require('console-log-colors');

const mockCards = [
    buildMockCard({
        title: 'Aggression Force Base',
        hp: 28,
        text: 'When a friendly Force unit attacks: The Force is with you (create your Force token).',
        aspects: ['aggression'],
        types: ['base'],
        setId: {
            set: 'LOF',
            number: 25
        },
        unique: false,
        internalName: 'aggression-force-base'
    }),
    buildMockCard({
        title: 'Cunning Force Base',
        hp: 28,
        text: 'When a friendly Force unit attacks: The Force is with you (create your Force token).',
        aspects: ['cunning'],
        types: ['base'],
        setId: {
            set: 'LOF',
            number: 27
        },
        unique: false,
        internalName: 'cunning-force-base'
    })
];

/** @param {{ title: string, subtitle: string?, cost: number?, hp: number?, unique: boolean, upgradeHp: number?, upgradePower: number?, aspects: string[]?, traits: string[]?, keywords: string[]?, types: string[], setId: { set: string, number: number }, internalName: string }} cardData */
function buildMockCard(cardData) {
    return {
        title: cardData.title,
        subtitle: cardData.subtitle || '',
        cost: cardData.cost || null,
        hp: cardData.hp || null,
        power: cardData.power || null,
        text: cardData.keywords?.join('\n') || '',
        deployBox: null,
        epicAction: '',
        unique: cardData.unique,
        rules: null,
        reprints: {
            data: []
        },
        upgradePower: cardData.upgradePower || null,
        upgradeHp: cardData.upgradeHp || null,
        id: cardData.internalName + '-id',
        aspects: cardData.aspects || [],
        traits: cardData.traits || [],
        keywords: cardData.keywords || [],
        types: cardData.types,
        setId: cardData.setId,
        internalName: cardData.internalName
    };
}

function buildSetStr(card) {
    return `${card.setId.set}_${card.setId.number}`;
}

function addMockCards(cards) {
    const setIds = new Set();

    for (const card of cards) {
        setIds.add(buildSetStr(card));
    }

    for (const card of mockCards) {
        const setStr = buildSetStr(card);

        if (setIds.has(setStr)) {
            console.log(color(`\nCard '${setStr}' found in official data. The mock can now be safely removed.\n`, 'yellow'));
        } else {
            cards.push(card);
        }
    }
}

module.exports = { addMockCards };
