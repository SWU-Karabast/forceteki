const AbilityLimit = require('./AbilityLimit');
const AbilityDsl = require('./abilitydsl');
const ThenAbility = require('./ThenAbility');
const Costs = require('./Costs.js');
const { Locations, CardTypes, EffectNames, Players } = require('./Constants');
import { InitiateDuel } from "./Interfaces";

export const initiateDuel = (game, card, properties) => {
    if (properties.initiateDuel) {
        if (card.type === CardTypes.Character) {
            initiateDuelFromCharacter(game, card, properties);
        } else {
            initiateDuelFromOther(game, card, properties);
        }
    }
}

const checkChallengerCondition = (card, context, properties) => {
    const requiresConflict = getProperty(properties, context, 'requiresConflict');
    const challengerCondition = getProperty(properties, context, 'challengerCondition');

    // default target condition
    if (!challengerCondition) {
        return !requiresConflict || card.isParticipating();
    }
    return challengerCondition(card, context);
}

const initiateDuelFromCharacter = (game, card, properties) => {
    let prevCondition = properties.condition;
    properties.condition = (context) => {
        const abilityCondition = (!prevCondition || prevCondition(context));
        const challengerCondition = checkChallengerCondition(card, context, properties);
        return abilityCondition && challengerCondition;
    }
    properties.target = {
        ...getBaselineDuelTargetProperties(card, properties),
        gameAction: AbilityDsl.actions.duel((context) => {
            const duelProperties = getProperty(properties, context);
            return Object.assign({ challenger: context.source }, duelProperties);
        })
    };
}

const initiateDuelFromOther = (game, card, properties) => {
    properties.targets = {
        challenger: {
            cardType: CardTypes.Character,
            player: (context) => {
                const opponentChoosesChallenger = getProperty(properties, context, 'opponentChoosesChallenger');
                return opponentChoosesChallenger ? Players.Opponent : Players.Self;
            },
            controller: Players.Self,
            cardCondition: (card, context) => checkChallengerCondition(card, context, properties)
        },
        duelTarget: {
            dependsOn: 'challenger',
            ...getBaselineDuelTargetProperties(undefined, properties),
            gameAction: AbilityDsl.actions.duel((context) => {
                const duelProperties = getProperty(properties, context);
                return Object.assign({ challenger: context.targets.challenger }, duelProperties);
            })
        }
    };    
}

const getBaselineDuelTargetProperties = (challenger, properties) => {
    const props = {
        cardType: CardTypes.Character,
        player: (context) => {
            const opponentChoosesDuelTarget = getProperty(properties, context, 'opponentChoosesDuelTarget');
            return opponentChoosesDuelTarget ? Players.Opponent : Players.Self;
        },
        controller: Players.Opponent,
        cardCondition: (card, context) => {
            const challengerCard = challenger ?? context.targets.challenger;

            if (challengerCard === card) {
                return false;
            }
            const requiresConflict = getProperty(properties, context, 'requiresConflict');
            const targetCondition = getProperty(properties, context, 'targetCondition');
            // default target condition
            if (!targetCondition) {
                return !requiresConflict || card.isParticipating();
            }
            return targetCondition(card, context);
        },        
    };
    return props;
}

const getProperty = (properties, context, propName?) => {
    let duelProperties: InitiateDuel;

    if (typeof properties.initiateDuel === 'function') {
        duelProperties = properties.initiateDuel(context);
    } else {
        duelProperties = properties.initiateDuel;
    }

    // default values
    duelProperties = {
        requiresConflict: true,
        ...duelProperties
    }

    if (!propName) {
        return duelProperties;
    }

    return duelProperties?.[propName];
}