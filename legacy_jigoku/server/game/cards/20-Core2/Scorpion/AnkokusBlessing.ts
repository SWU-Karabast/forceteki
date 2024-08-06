import { Locations, Phases } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class AnkokusBlessing extends DrawCard {
    static id = 'ankoku-s-blessing';

    setupCardAbilities() {
        this.action({
            title: 'Gain 2 fate and draw 2 cards',
            phase: Phases.Fate,
            cost: AbilityDsl.costs.discardCard({
                location: Locations.Hand,
                cardCondition: (card) => !card.hasTrait('blessing')
            }),
            gameAction: AbilityDsl.actions.multipleContext((context) => ({
                gameActions: [
                    AbilityDsl.actions.draw({ target: context.player, amount: 2 }),
                    AbilityDsl.actions.gainFate({ target: context.player, amount: 2 })
                ]
            })),
            max: AbilityDsl.limit.perRound(1),
            effect: 'draw 2 cards and gain 2 fate'
        });
    }
}
