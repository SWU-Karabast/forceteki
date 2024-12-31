import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';

export default class BosskHuntingHisPrey extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2526288781',
            internalName: 'bossk#hunting-his-prey',
        };
    }

    protected override setupLeaderSideAbilities() {
        // this.addActionAbility({
        //     title: 'Deal 1 damage to a unit with a Bounty. You may give it +1/+0 for this phase.',
        //     cost: [AbilityHelper.costs.exhaustSelf()],
        //     targetResolver: {
        //         cardTypeFilter: WildcardCardType.Unit,
        //         cardCondition: (card) => card.hasSomeKeyword(KeywordName.Bounty),
        //         immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
        //     },
        //     then: (thenContext) => ({
        //         title: 'Give it +1/+0 for this phase',
        //         thenCondition: () => !!thenContext.target,
        //         optional: true,
        //         immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
        //             effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
        //         })
        //     })
        // });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addTriggeredAbility({
            title: 'Collect the Bounty again',
            optional: true,
            when: {
                onBountyCollected: (event, context) => event.context.player === context.source.controller
            },
            immediateEffect: AbilityHelper.immediateEffects.collectBounty((context) => ({
                bountyProperties: context.event.bountyProperties,
                bountySource: context.event.card
            })),
            limit: AbilityHelper.limit.perRound(1)
        });
    }
}

BosskHuntingHisPrey.implemented = true;
