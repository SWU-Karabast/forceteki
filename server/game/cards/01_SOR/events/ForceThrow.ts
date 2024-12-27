import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { TargetMode, WildcardCardType, Trait } from '../../../core/Constants';

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
                optional: true,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: () => ifYouDoContext.source.controller.isTraitInPlay(Trait.Force),
                    onTrue: AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        innerSystem: AbilityHelper.immediateEffects.damage({ amount: ifYouDoContext.events[0]?.card?.printedCost ?? 0 })
                    }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                })
            })
        });
    }
}

ForceThrow.implemented = true;
