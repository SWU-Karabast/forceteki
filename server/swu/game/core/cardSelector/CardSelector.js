const ExactlyXCardSelector = require('./ExactlyXCardSelector');
const ExactlyVariableXCardSelector = require('./ExactlyVariableXCardSelector');
const MaxStatCardSelector = require('./MaxStatCardSelector');
const SingleCardSelector = require('./SingleCardSelector');
const UnlimitedCardSelector = require('./UnlimitedCardSelector');
const UpToXCardSelector = require('./UpToXCardSelector');
const UpToVariableXCardSelector = require('./UpToVariableXCardSelector');
const { TargetModes, CardTypes } = require('../Constants');

const defaultProperties = {
    numCards: 1,
    cardCondition: () => true,
    numCardsFunc: () => 1,
    cardType: [CardTypes.Upgrade, CardTypes.Unit, CardTypes.Event, CardTypes.Leader, CardTypes.Base],
    multiSelect: false,
    sameDiscardPile: false
};

const ModeToSelector = {
    ability: p => new SingleCardSelector(p),
    autoSingle: p => new SingleCardSelector(p),
    exactly: p => new ExactlyXCardSelector(p.numCards, p),
    exactlyVariable: p => new ExactlyVariableXCardSelector(p.numCardsFunc, p),
    maxStat: p => new MaxStatCardSelector(p),
    single: p => new SingleCardSelector(p),
    token: p => new SingleCardSelector(p),
    elementSymbol: p => new SingleCardSelector(p),
    unlimited: p => new UnlimitedCardSelector(p),
    upTo: p => new UpToXCardSelector(p.numCards, p),
    upToVariable: p => new UpToVariableXCardSelector(p.numCardsFunc, p)
};

class CardSelector {
    static for(properties) {
        properties = CardSelector.getDefaultedProperties(properties);

        let factory = ModeToSelector[properties.mode];

        if(!factory) {
            throw new Error(`Unknown card selector mode of ${properties.mode}`);
        }

        return factory(properties);
    }

    static getDefaultedProperties(properties) {
        properties = Object.assign({}, defaultProperties, properties);
        if(properties.mode) {
            return properties;
        }

        if(properties.maxStat) {
            properties.mode = TargetModes.MaxStat;
        } else if(properties.numCards === 1 && !properties.multiSelect) {
            properties.mode = TargetModes.Single;
        } else if(properties.numCards === 0) {
            properties.mode = TargetModes.Unlimited;
        } else {
            properties.mode = TargetModes.UpTo;
        }

        return properties;
    }
}

module.exports = CardSelector;
