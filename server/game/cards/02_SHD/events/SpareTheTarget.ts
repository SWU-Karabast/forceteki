import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class SpareTheTarget extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5283722046',
            internalName: 'spare-the-target',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Return an enemy non-leader unit to its owner\'s hand. Collect that unit\'s Bounties.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.returnToHand(),
                    AbilityHelper.immediateEffects.collectBounty((context) => {
                        const bountyAbilities = context.target.getTriggeredAbilities().filter(
                            (ability) => ability.keyword === KeywordName.Bounty
                        );

                        return {
                            bountyProperties: bountyAbilities.map((bountyAbility) => bountyAbility.properties),
                            bountySource: context.target
                        };
                    })
                ])
            }
        });
    }
}
