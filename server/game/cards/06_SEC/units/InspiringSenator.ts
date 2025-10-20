import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class InspiringSenator extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3791081057',
            internalName: 'inspiring-senator',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'The next Official unit you play this phase costs 1 resource less',
            immediateEffect: abilityHelper.immediateEffects.forThisPhasePlayerEffect({
                effect: abilityHelper.ongoingEffects.decreaseCost({
                    cardTypeFilter: WildcardCardType.Unit,
                    match: (card) => card.hasSomeTrait(Trait.Official),
                    limit: abilityHelper.limit.perPlayerPerGame(1),
                    amount: 1
                })
            })
        });
    }
}
