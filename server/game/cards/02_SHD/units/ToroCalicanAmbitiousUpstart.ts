import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, Trait } from '../../../core/Constants';

export default class ToroCalicanAmbitiousUpstart extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3952758746',
            internalName: 'toro-calican#ambitious-upstart',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'Deal 1 damage to the played Bounty Hunter unit to ready this unit',
            when: {
                onCardPlayed: (event, context) =>
                    event.card.hasSomeTrait(Trait.BountyHunter) &&
                    event.player === context.source.controller &&
                    event.cardTypeWhenInPlay === CardType.BasicUnit &&
                    event.card !== context.source
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
