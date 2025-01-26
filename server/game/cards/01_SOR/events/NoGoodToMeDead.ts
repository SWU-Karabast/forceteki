import AbilityHelper from '../../../AbilityHelper';
import { AbilityRestriction, Duration, WildcardCardType } from '../../../core/Constants';
import { EventCard } from '../../../core/card/EventCard';

export default class NoGoodToMeDead extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8800836530',
            internalName: 'no-good-to-me-dead',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Exhaust a unit. That unit can\'t ready this round (including during the regroup phase)',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.exhaust(),
                    AbilityHelper.immediateEffects.cardLastingEffect({
                        effect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.Ready),
                        duration: Duration.UntilEndOfRound
                    })
                ])
            },
        });
    }
}
