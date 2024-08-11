import AbilityDsl from '../../AbilityDsl';
import CardAbilityStep from '../ability/CardAbilityStep';
import { Location, CardType, EffectName, RelativePlayer } from '../Constants';
import { IInitiateAttack } from '../../Interfaces';

export const addInitiateAttackProperties = (properties) => {
    if (!properties.initiateAttack) {
        return;
    }

    properties.targets = {
        attacker: {
            cardType: CardType.Unit,
            player: (context) => {
                const opponentChoosesAttacker = getProperty(properties, context, 'opponentChoosesAttacker');
                return opponentChoosesAttacker ? RelativePlayer.Opponent : RelativePlayer.Self;
            },
            controller: RelativePlayer.Self,
            cost: AbilityDsl.costs.exhaustSelf(),
            cardCondition: (card, context) => checkAttackerCondition(card, context, properties)
        },
        attackTarget: {
            dependsOn: 'attacker',
            ...getBaselineAttackTargetProperties(undefined, properties),
            gameSystem: AbilityDsl.immediateEffects.attack((context) => {
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
        cardType: CardType.Unit,
        player: (context) => {
            const opponentChoosesAttackTarget = getProperty(properties, context, 'opponentChoosesAttackTarget');
            return opponentChoosesAttackTarget ? RelativePlayer.Opponent : RelativePlayer.Self;
        },
        controller: RelativePlayer.Opponent,
        cardCondition: (card, context) => {
            const attackerCard = attacker ?? context.targets.attacker;

            if (attackerCard === card) {
                return false;
            }
            const targetCondition = getProperty(properties, context, 'targetCondition');
            // default target condition
            return targetCondition ? targetCondition(card, context) : null;
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
