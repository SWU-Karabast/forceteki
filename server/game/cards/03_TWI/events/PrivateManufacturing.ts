import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';
import { RelativePlayer, TargetMode, ZoneName } from '../../../core/Constants';

export default class PrivateManufacturing extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2483520485',
            internalName: 'private-manufacturing',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Draw 2 cards. If you control no token units, put 2 cards from your hand on the bottom of your deck in any order.',
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.draw({ amount: 2 }),
                AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.getArenaUnits({ condition: (card) => card.isTokenUnit() }).length > 0,
                    onFalse: AbilityHelper.immediateEffects.selectCard({
                        activePromptTitle: 'Select 2 cards',
                        mode: TargetMode.Exactly,
                        controller: RelativePlayer.Self,
                        zoneFilter: ZoneName.Hand,
                        numCards: 2,
                        innerSystem: AbilityHelper.immediateEffects.moveToBottomOfDeck()
                    })
                })
            ])
        });
    }
}
