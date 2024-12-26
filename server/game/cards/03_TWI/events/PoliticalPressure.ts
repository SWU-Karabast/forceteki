import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, TargetMode } from '../../../core/Constants';

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
            targetResolver: {
                choosingPlayer: RelativePlayer.Opponent,
                mode: TargetMode.Select,
                choices: () => ({
                    ['Discard a random card from your hand']: AbilityHelper.immediateEffects.discardCardsFromOwnHand({ random: true, amount: 1 }),
                    ['Opponent creates 2 Battle Droid Tokens']: AbilityHelper.immediateEffects.createBattleDroid({ amount: 2 })
                })
            },
        });
    }
}

PoliticalPressure.implemented = true;
