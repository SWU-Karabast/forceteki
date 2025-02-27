import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName, RelativePlayer, Trait } from '../../../core/Constants';

export default class Snowspeeder extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1862616109',
            internalName: 'snowspeeder',
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
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
