import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer } from '../../../core/Constants';

export default class PoliticalPressure extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3357486161',
            internalName: 'political-pressure',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Discard a random card from your hand',
            optional: true,
            abilityController: RelativePlayer.Opponent,
            immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand({ amount: 1, random: true }),
            ifYouDoNot: {
                title: 'Opponent creates 2 Battle Droid Tokens',
                immediateEffect: AbilityHelper.immediateEffects.createBattleDroid({ amount: 2 })
            }
        });
    }
}

PoliticalPressure.implemented = true;
