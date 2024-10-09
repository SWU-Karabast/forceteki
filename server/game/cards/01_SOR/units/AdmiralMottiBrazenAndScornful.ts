import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, WildcardLocation } from '../../../core/Constants';

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
                locationFilter: WildcardLocation.AnyArena,
                cardCondition: (card) => card.isUnit() && card.aspects.includes(Aspect.Villainy),
                immediateEffect: AbilityHelper.immediateEffects.ready()
            }
        });
    }
}

AdmiralMottiBrazenAndScornful.implemented = true;
