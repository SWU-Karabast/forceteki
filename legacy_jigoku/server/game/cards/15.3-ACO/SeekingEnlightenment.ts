import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class SeekingEnlightenment extends ProvinceCard {
    static id = 'seeking-enlightenment';

    setupCardAbilities() {
        this.reaction({
            title: 'Force opponent to lose fate equal to the number of attackers',
            when: {
                onCardRevealed: (event, context) => event.card === context.source
            },
            gameAction: AbilityDsl.actions.loseFate((context) => ({
                amount: context.game.currentConflict?.getNumberOfParticipantsFor?.('attacker') ?? 0
            }))
        });
    }
}
