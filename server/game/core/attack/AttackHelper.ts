import AbilityHelper from '../../AbilityHelper';
import { RelativePlayer, WildcardCardType } from '../Constants';
import { IInitiateAttack } from '../../Interfaces';

export const addInitiateAttackProperties = (properties) => {
    if (!properties.initiateAttack) {
        return;
    }

    properties.targetResolvers = {
        // TODO THIS PR: change to targetResolver (singular)
        attacker: {
            cardTypeFilter: WildcardCardType.Unit,
            player: (context) => {
                // TODO THIS PR: rename getProperty
                const opponentChoosesAttacker = getProperty(properties, context, 'opponentChoosesAttacker');
                return opponentChoosesAttacker ? RelativePlayer.Opponent : RelativePlayer.Self;
            },

            immediateEffect: AbilityHelper.immediateEffects.initiateUnitAttack((context) => {
                const attackProperties = Object.assign({
                    attacker: context.targets.attacker
                }, getProperty(properties, context));

                return { attackProperties };
            })
        }
    };
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
