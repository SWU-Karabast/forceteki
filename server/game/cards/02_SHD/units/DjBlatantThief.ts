import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { PlayType, RelativePlayer } from '../../../core/Constants';

export default class DjBlatantThief extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4002861992',
            internalName: 'dj#blatant-thief',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Take control of an enemy resource. When this unit leaves play, that resource\'s owner takes control of it.',
            when: {
                onCardPlayed: (event, context) =>
                    event.card === context.source &&
                    event.playType === PlayType.Smuggle
            },
            immediateEffect: AbilityHelper.immediateEffects.sequential((sequentialContext) => [
                AbilityHelper.immediateEffects.takeControlOfResource((context) => ({ target: context.player })),
                AbilityHelper.immediateEffects.delayedCardEffect((delayedEffectContext) => ({
                    title: 'Return the stolen resource to its owner',
                    when: {
                        onCardLeavesPlay: (event, context) => event.card === context.source
                    },
                    target: delayedEffectContext.source,
                    immediateEffect: AbilityHelper.immediateEffects.resourceCard({
                        targetPlayer: RelativePlayer.Opponent,
                        target: sequentialContext.events[0].card
                    })
                }))
            ])
        });
    }
}

DjBlatantThief.implemented = true;
