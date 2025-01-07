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
                AbilityHelper.immediateEffects.whenSourceLeavesPlayDelayedCardEffect({
                    title: 'Return the stolen resource to its owner',
                    // we use a context handler here to force evaluation of the target's exhausted state to happen when the delayed effect resolves,
                    // instead of when it's created
                    immediateEffect: AbilityHelper.immediateEffects.resourceCard((_context) => ({
                        targetPlayer: RelativePlayer.Opponent,
                        target: sequentialContext.events[0].card,
                        readyResource: !sequentialContext.events[0].card.exhausted
                    }))
                })
            ])
        });
    }
}

DjBlatantThief.implemented = true;
