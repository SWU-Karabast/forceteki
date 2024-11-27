import { log } from 'console';
import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { TargetMode, WildcardZoneName, WildcardCardType, Trait, EventName } from '../../../core/Constants';

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
            then: (thenContext) => ({
                title: 'If you control a Force unit, you may deal damage to a unit equal to the cost of the discarded card',
                optional: true,
                thenCondition: () => thenContext.source.controller.isTraitInPlay(Trait.Force),
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.damage(() =>
                        ({ amount: thenContext.events[0].card.printedCost }))
                }
            })
        });
    }
}

ForceThrow.implemented = true;
