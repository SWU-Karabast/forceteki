import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, Conjunction, WildcardCardType } from '../../../core/Constants';
import { aspectString } from '../../../core/utils/EnumHelpers';

export default class KananJarrusSpectreOne extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0260770639',
            internalName: 'kanan-jarrus#spectre-one',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Return a non-leader unit that costs 2 or less to it's owner's hand. If you control a ${aspectString([Aspect.Command, Aspect.Aggression], Conjunction.Or)} unit, return a non-leader unit that costs 4 or less instead`,
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card, context) => {
                    const cost = context.player.isAspectInPlay([Aspect.Command, Aspect.Aggression]) ? 4 : 2;
                    return card.isUnit() && card.cost <= cost;
                },
                activePromptTitle: 'Return a non-leader unit to its owner\'s hand',
                immediateEffect: abilityHelper.immediateEffects.returnToHand(),
            }
        });
    }
}
