import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class LightsaberThrow extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0721742014',
            internalName: 'lightsaber-throw',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Discard a Lightsaber card from your hand. If you do, deal 4 damage to a ground unit and draw a card.',
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand(() => ({
                    cardTypeFilter: WildcardCardType.Any,
                    controller: RelativePlayer.Self,
                    cardCondition: (card) => card.hasSomeTrait(Trait.Lightsaber),
                    amount: 1
                })),
            },
            ifYouDo: {
                title: 'Deal 4 damage to a ground unit and draw a card',
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        zoneFilter: ZoneName.GroundArena,
                        innerSystem: AbilityHelper.immediateEffects.damage({ amount: 4 })
                    }),
                    AbilityHelper.immediateEffects.draw()
                ])
            }
        });
    }
}