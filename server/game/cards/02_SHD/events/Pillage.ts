import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { Location, RelativePlayer, TargetMode } from '../../../core/Constants';

export default class Pillage extends EventCard {
    protected override getImplementationId () {
        return {
            id: '4772866341',
            internalName: 'pillage',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Choose a player. They discard 2 cards from their hand',
            targetResolver: {
                mode: TargetMode.Select,
                choices: ({
                    ['You']: AbilityHelper.immediateEffects.selectCard({
                        controller: RelativePlayer.Self,
                        locationFilter: Location.Hand,
                        numCards: 2,
                        innerSystem: AbilityHelper.immediateEffects.discardCard()
                    }),
                    ['Opponent']: AbilityHelper.immediateEffects.selectCard({
                        controller: RelativePlayer.Opponent,
                        locationFilter: Location.Hand,
                        numCards: 2,
                        innerSystem: AbilityHelper.immediateEffects.discardCard()
                    }),
                })
            }
        });
    }
}

Pillage.implemented = true;
