import { CardTypes, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class IntrepidScout extends DrawCard {
    static id = 'intrepid-scout';

    setupCardAbilities() {
        this.action({
            title: 'Move a character to the conflict',
            condition: (context) => context.source.isParticipating(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                gameAction: AbilityDsl.actions.moveToConflict()
            }
        });
    }
}
