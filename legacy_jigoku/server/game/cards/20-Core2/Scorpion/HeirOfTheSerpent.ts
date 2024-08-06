import { CardTypes, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class HeirOfTheSerpent extends DrawCard {
    static id = 'heir-of-the-serpent';

    setupCardAbilities() {
        this.action({
            title: 'Move a character into or out of the conflict',
            condition: (context) => (context.source as DrawCard).isParticipating(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                gameAction: AbilityDsl.actions.multiple([
                    AbilityDsl.actions.sendHome(),
                    AbilityDsl.actions.moveToConflict()
                ])
            }
        });
    }
}
