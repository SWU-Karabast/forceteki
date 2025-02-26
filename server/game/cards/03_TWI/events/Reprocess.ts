import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';
import { RelativePlayer, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class Reprocess extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7579458834',
            internalName: 'reprocess'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose up to 4 units in your discard pile. Put them on the bottom of your deck in a random order and create that many Battle Droid tokens.',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 4,
                zoneFilter: ZoneName.Discard,
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.moveToBottomOfDeck((context) => ({
                        target: context.target,
                        shuffleMovedCards: true
                    })),
                    AbilityHelper.immediateEffects.createBattleDroid((context) => ({
                        amount: context.target.length,
                        target: context.player
                    }))
                ])
            }
        });
    }
}
