import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, WildcardZoneName } from '../../../core/Constants';

export default class AdmiralMottiBrazenAndScornful extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9996676854',
            internalName: 'admiral-motti#brazen-and-scornful'
        };
    }

    public override setupCardAbilities() {
        this.addWhenDefeatedAbility({
            title: 'Ready a Villainy unit',
            optional: true,
            targetResolver: {
                zoneFilter: WildcardZoneName.AnyArena,
                cardCondition: (card) => card.isUnit() && card.aspects.includes(Aspect.Villainy),
                immediateEffect: AbilityHelper.immediateEffects.ready()
            }
        });
    }
}

AdmiralMottiBrazenAndScornful.implemented = true;
