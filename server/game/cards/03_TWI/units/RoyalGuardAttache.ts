import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class RoyalGuardAttache extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '0598115741',
            internalName: 'royal-guard-attache'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'When Played: Deal 2 damage to this unit.',
            optional: false,
            when: {
                onCardPlayed: (event, context) => event.card.controller === context.source.controller
            },
            immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 }),
        });
    }
}

RoyalGuardAttache.implemented = true;