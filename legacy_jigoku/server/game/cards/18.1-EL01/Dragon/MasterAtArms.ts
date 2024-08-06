import AbilityDsl from '../../../abilitydsl';
import { Locations, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class MasterAtArms extends DrawCard {
    static id = 'master-at-arms';

    setupCardAbilities() {
        this.reaction({
            title: 'Return a weapon attachment in your conflict discard pile to your hand',
            when: {
                onCardPlayed: (event, context) => event.card === context.source
            },
            target: {
                activePromptTitle: 'Choose a weapon attachment from your conflict discard pile',
                cardCondition: (card) => card.hasTrait('weapon'),
                location: [Locations.ConflictDiscardPile],
                controller: Players.Self,
                gameAction: AbilityDsl.actions.moveCard({ destination: Locations.Hand })
            }
        });
    }
}
