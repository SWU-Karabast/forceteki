import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class MigsMayfeldTriggerman extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6910883839',
            internalName: 'migs-mayfeld#triggerman'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'You may deal 2 damage to a unit or base.',
            limit: AbilityHelper.limit.perRound(1),
            optional: true,
            when: {
                onCardDiscarded: (event) => event.discardedFromZone === ZoneName.Hand,
            },
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.damage(() => ({ amount: 2 }))
            }
        });
    }
}
