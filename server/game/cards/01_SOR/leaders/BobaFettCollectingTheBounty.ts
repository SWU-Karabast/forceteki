import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';

export default class BobaFettCollectingTheBounty extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4626028465',
            internalName: 'boba-fett#collecting-the-bounty',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addTriggeredAbility({
            title: 'Ready a resource',
            cost: AbilityHelper.costs.exhaustSelf(),
            when: {
                onCardReturnedToHand: (event, context) => event.card.isUnit() && event.card.controller !== context.source.controller && context.source.controller.resources.some((resource) => resource.exhausted),
                onCardDefeated: (event, context) => event.card.isUnit() && event.card.controller !== context.source.controller && context.source.controller.resources.some((resource) => resource.exhausted),
            },
            immediateEffect: AbilityHelper.immediateEffects.readyResources({ amount: 1 })
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addTriggeredAbility({
            title: 'Ready 2 resources',
            when: {
                onAttackCompleted: (event, context) => event.attack.attacker === context.source,
            },
            immediateEffect: AbilityHelper.immediateEffects.readyResources({ amount: 2 })
        });
    }
}

BobaFettCollectingTheBounty.implemented = true;
