import AbilityHelper from '../../AbilityHelper';
import { Location, RelativePlayer, WildcardCardType } from '../Constants';
import { IInitiateAttack } from '../../Interfaces';
import * as EnumHelpers from '../utils/EnumHelpers';

export const addInitiateAttackProperties = (properties) => {
    if (!properties.initiateAttack) {
        return;
    }

    properties.targetResolvers = {
        attacker: {
            cardTypeFilter: WildcardCardType.Unit,
            player: (context) => {
                const opponentChoosesAttacker = getProperty(properties, context, 'opponentChoosesAttacker');
                return opponentChoosesAttacker ? RelativePlayer.Opponent : RelativePlayer.Self;
            },
            controller: RelativePlayer.Self,
            cardCondition: (card, context) => checkAttackerCondition(card, context, properties),

            immediateEffect: AbilityHelper.immediateEffects.initiateUnitAttack((context) => {
                const attackProperties = getProperty(properties, context);
                return Object.assign({
                    attacker: context.targets.attacker
                }, attackProperties);
            })
        }
    };
};

const checkAttackerCondition = (card, context, properties) => {
    const attackerCondition = getProperty(properties, context, 'attackerCondition');

    return attackerCondition ? attackerCondition(card, context) : true;
};

const getBaselineAttackTargetProperties = (attacker, properties) => {
    const props = {
        player: (context) => {
            const opponentChoosesAttackTarget = getProperty(properties, context, 'opponentChoosesAttackTarget');
            return opponentChoosesAttackTarget ? RelativePlayer.Opponent : RelativePlayer.Self;
        },
        controller: RelativePlayer.Opponent,
        cardCondition: (card, context) => {
            // if attacker was not declared in advance, get it dynamically from the context
            const attackerCard = attacker ?? context.targets.attacker;

            if (attackerCard === card) {
                return false;
            }

            const targetCondition = getProperty(properties, context, 'targetCondition');

            // default target condition
            if (!targetCondition) {
                return EnumHelpers.isAttackableLocation(card.location) && (card.location === attackerCard.location || card.location === Location.Base);
            }

            return targetCondition(card, context);
        },
    };
    return props;
};

const getProperty = (properties, context, propName?) => {
    let attackProperties: IInitiateAttack;

    if (typeof properties.initiateAttack === 'function') {
        attackProperties = properties.initiateAttack(context);
    } else {
        attackProperties = properties.initiateAttack;
    }

    if (!propName) {
        return attackProperties;
    }

    return attackProperties?.[propName];
};
