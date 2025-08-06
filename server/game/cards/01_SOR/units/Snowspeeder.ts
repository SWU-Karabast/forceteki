import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName, RelativePlayer, Trait } from '../../../core/Constants';

export default class Snowspeeder extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1862616109',
            internalName: 'snowspeeder',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Exhaust an enemy Vehicle ground unit',
            targetResolver: {
                zoneFilter: ZoneName.GroundArena,
                controller: RelativePlayer.Opponent,
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Vehicle),
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });
    }
}
