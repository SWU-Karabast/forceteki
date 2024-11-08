import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class PowerOfTheDarkSide extends EventCard {
    protected override getImplementationId () {
        return {
            id: '0176921487',
            internalName: 'power-of-the-dark-side',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'An opponent chooses a unit they control. Defeat that unit',
            targetResolver: {
                choosingPlayer: RelativePlayer.Opponent,
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}

PowerOfTheDarkSide.implemented = true;
