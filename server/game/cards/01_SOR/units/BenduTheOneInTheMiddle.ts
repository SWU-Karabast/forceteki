import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, WildcardCardType } from '../../../core/Constants';

export default class BenduTheOneInTheMiddle extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5707383130',
            internalName: 'bendu#the-one-in-the-middle',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'The next non-Heroism, non-Villainy card you play this phase costs 2 less',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
                effect: AbilityHelper.ongoingEffects.decreaseCost({
                    cardTypeFilter: WildcardCardType.Playable,
                    match: (card) => !card.hasSomeAspect(Aspect.Heroism) && !card.hasSomeAspect(Aspect.Villainy),
                    limit: AbilityHelper.AbilityLimit.perPlayerPerGame(1),
                    amount: 2
                })
            })
        });
    }
}
