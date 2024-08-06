import { CardTypes, Players } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class ItinerantPhilosopher extends DrawCard {
    static id = 'itinerant-philosopher';

    setupCardAbilities() {
        this.action({
            title: 'Bow a character',
            condition: (context) => context.source.isParticipating(),
            cost: AbilityDsl.costs.discardImperialFavor(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Opponent,
                cardCondition: (card) => card.isParticipating() && card.attachments.length > 0,
                gameAction: AbilityDsl.actions.bow()
            }
        });
    }
}
