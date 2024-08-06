import { CardTypes, Phases, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class DarkflamePurifier extends DrawCard {
    static id = 'darkflame-purifier';

    setupCardAbilities() {
        this.reaction({
            title: 'Dishonor a character',
            when: {
                onMoveFate: (event, context) =>
                    context.game.currentPhase !== Phases.Fate &&
                    event.origin?.type === CardTypes.Character &&
                    event.origin?.controller === context.player.opponent &&
                    event.fate > 0
            },
            target: {
                controller: Players.Any,
                cardType: CardTypes.Character,
                gameAction: AbilityDsl.actions.dishonor()
            }
        });
    }
}