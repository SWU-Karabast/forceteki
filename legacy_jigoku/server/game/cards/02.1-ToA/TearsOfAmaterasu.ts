import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class TearsOfAmaterasu extends ProvinceCard {
    static id = 'tears-of-amaterasu';

    setupCardAbilities() {
        this.reaction({
            title: 'Gain fate equal to the number of attackers',
            when: {
                onCardRevealed: (event, context) => event.card === context.source
            },
            gameAction: AbilityDsl.actions.gainFate((context) => ({
                amount: context.game.currentConflict?.getNumberOfParticipantsFor?.('attacker') ?? 0
            }))
        });
    }
}
