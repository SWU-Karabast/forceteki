import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class RestorationOfBalance extends ProvinceCard {
    static id = 'restoration-of-balance';

    public setupCardAbilities() {
        this.interrupt({
            title: 'Force opponent to discard to 4 cards',
            when: {
                onBreakProvince: (event, context) =>
                    event.card === context.source && context.player.opponent !== undefined
            },
            gameAction: AbilityDsl.actions.chosenDiscard((context) => ({
                amount: Math.max(0, context.player.opponent.hand.size() - 4)
            }))
        });
    }
}
