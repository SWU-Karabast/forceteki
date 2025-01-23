import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';

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
            immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                amount: 1,
                random: true,
                target: context.player.opponent
            })),
            ifYouDoNot: {
                title: 'Opponent creates 2 Battle Droid Tokens',
                immediateEffect: AbilityHelper.immediateEffects.createBattleDroid({ amount: 2 })
            }
        });
    }
}

PoliticalPressure.implemented = true;
