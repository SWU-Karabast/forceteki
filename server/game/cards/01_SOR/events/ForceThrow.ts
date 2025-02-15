import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { TargetMode, Trait, WildcardCardType } from '../../../core/Constants';

export default class ForceThrow extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1705806419',
            internalName: 'force-throw',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose a player. That player discards a card from their hand',
            targetResolver: {
                mode: TargetMode.Player,
                immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand({ amount: 1 }),
            },
            ifYouDo: (ifYouDoContext) => ({
                title: `Deal damage to a unit equal to the cost of ${ifYouDoContext.events[0]?.card?.title} (${ifYouDoContext.events[0]?.card?.printedCost} damage)`,
                ifYouDoCondition: () => ifYouDoContext.source.controller.isTraitInPlay(Trait.Force),
                optional: true,
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: ifYouDoContext.events[0]?.card?.printedCost ?? 0 })
                }
            })
        });
    }
}
