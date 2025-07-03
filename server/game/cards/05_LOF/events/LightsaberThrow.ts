import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, Trait, ZoneName } from '../../../core/Constants';

export default class LightsaberThrow extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0721742014',
            internalName: 'lightsaber-throw',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setEventAbility({
            title: 'Discard a Lightsaber card from your hand. If you do, deal 4 damage to a ground unit and draw a card.',
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                cardCondition: (card) => card.hasSomeTrait(Trait.Lightsaber),
                immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard(),
            },
            ifYouDo: {
                title: 'Deal 4 damage to a ground unit and draw a card',
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.selectCard({
                        zoneFilter: ZoneName.GroundArena,
                        immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 4 })
                    }),
                    AbilityHelper.immediateEffects.draw()
                ])
            }
        });
    }
}