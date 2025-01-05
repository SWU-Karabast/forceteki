import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { PlayType } from '../../../core/Constants';

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
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.takeControlOfResource((context) => ({ target: context.player }))
            ])
        });
    }
}

DjBlatantThief.implemented = true;
