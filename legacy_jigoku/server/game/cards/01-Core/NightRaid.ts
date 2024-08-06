import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class NightRaid extends ProvinceCard {
    static id = 'night-raid';

    setupCardAbilities() {
        this.reaction({
            title: 'Force opponent to discard cards equal to the number of attackers',
            when: {
                onCardRevealed: (event, context) => event.card === context.source
            },
            gameAction: AbilityDsl.actions.chosenDiscard((context) => ({
                amount: context.game.currentConflict?.getNumberOfParticipantsFor?.('attacker') ?? 0
            }))
        });
    }
}
