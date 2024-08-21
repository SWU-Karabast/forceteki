import AbilityHelper from '../../AbilityHelper';
import CardAbilityStep from '../ability/CardAbilityStep';
import { Location, CardType, EffectName, RelativePlayer, WildcardCardType } from '../Constants';
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

            // this is to pay the exhaust cost for the attacker
            // TODO: need to investigate to see if this resolves at the right point in the attack
            // (experiment with something that would trigger off of the exhaust to make sure it happens at the right time)
            // if not, try splitting the two with a "then" clause to get exhaust to fire first
            immediateEffect: AbilityHelper.immediateEffects.exhaust({ isCost: true })
        },
        attackTarget: {
            dependsOn: 'attacker',
            // TODO: if we want to choose a specific character in advance to initiate the attack,
            // change the first parameter here from 'undefined'
            ...getBaselineAttackTargetProperties(undefined, properties),
            immediateEffect: AbilityHelper.immediateEffects.attack((context) => {
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
