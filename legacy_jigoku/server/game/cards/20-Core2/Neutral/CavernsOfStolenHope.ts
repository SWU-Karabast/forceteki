import { ProvinceCard } from '../../../ProvinceCard';
import AbilityDsl from '../../../abilitydsl';

export default class CavernsOfStolenHope extends ProvinceCard {
    static id = 'caverns-of-stolen-hope';

    setupCardAbilities() {
        this.reaction({
            title: 'Force opponent to discard random cards equal to the number of attackers',
            when: {
                onCardRevealed: (event, context) => event.card === context.source
            },
            gameAction: AbilityDsl.actions.discardAtRandom((context) => ({
                amount: Math.max(0, context.game.currentConflict?.getNumberOfParticipantsFor?.('attacker') ?? 0)
            }))
        });
    }
}
