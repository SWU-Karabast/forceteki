import { Durations } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class PassionatePoet extends DrawCard {
    static id = 'passionate-poet';

    setupCardAbilities() {
        this.action({
            title: 'Give all participating enemies -1/-1',
            condition: (context) => (context.source as DrawCard).isParticipating(),
            gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                target: context.game.currentConflict.getCharacters(context.player.opponent),
                effect: AbilityDsl.effects.modifyBothSkills(-1),
                duration: Durations.UntilEndOfConflict
            })),
            effect: 'give all participating enemies -1{1}/-1{2} until the end of the conflict',
            effectArgs: ['military', 'political']
        });
    }
}
