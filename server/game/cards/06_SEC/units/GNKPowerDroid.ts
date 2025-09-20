import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class GNKPowerDroid extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'gnk-power-droid-id',
            internalName: 'gnk-power-droid',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'The next unit you play this phase costs 1 resource less',
            immediateEffect: abilityHelper.immediateEffects.forThisPhasePlayerEffect({
                ongoingEffectDescription: 'discount the next unit played by',
                ongoingEffectTargetDescription: 'them',
                effect: abilityHelper.ongoingEffects.decreaseCost({
                    cardTypeFilter: WildcardCardType.Unit,
                    limit: abilityHelper.limit.perPlayerPerGame(1),
                    amount: 1
                })
            }),
        });
    }
}
