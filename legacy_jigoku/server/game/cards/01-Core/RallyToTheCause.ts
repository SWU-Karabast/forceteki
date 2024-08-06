import { ProvinceCard } from '../../ProvinceCard';

export default class RallyToTheCause extends ProvinceCard {
    static id = 'rally-to-the-cause';

    setupCardAbilities() {
        this.reaction({
            title: 'Switch the conflict type',
            when: {
                onCardRevealed: (event, context) => event.card === context.source && this.game.isDuringConflict()
            },
            effect: 'switch the conflict type',
            handler: () => this.game.currentConflict.switchType()
        });
    }
}
