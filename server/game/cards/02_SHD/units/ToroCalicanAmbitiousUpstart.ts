import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class ToroCalicanAmbitiousUpstart extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3952758746',
            internalName: 'toro-calican#ambitious-upstart',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Deal 1 damage to the played Bounty Hunter unit',
            when: {
                onCardPlayed: (event) =>
                    event.card.hasSomeTrait(Trait.BountyHunter) &&
                    event.card.controller === this.controller &&
                    event.card.isUnit()
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({ amount: 1, target: context.event.card })),
            limit: AbilityHelper.limit.perRound(1),
            ifYouDo: {
                title: 'Ready Toro Calican',
                immediateEffect: AbilityHelper.immediateEffects.ready()
            }
        });
    }
}

ToroCalicanAmbitiousUpstart.implemented = true;
