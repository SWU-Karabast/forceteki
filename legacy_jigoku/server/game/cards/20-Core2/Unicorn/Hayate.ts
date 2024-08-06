import { CardTypes, Locations, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class Hayate extends DrawCard {
    static id = 'hayate';

    setupCardAbilities() {
        this.persistentEffect({
            location: Locations.Any,
            targetController: Players.Any,
            effect: AbilityDsl.effects.reduceCost({
                amount: (_, player) =>
                    (player.cardsInPlay as DrawCard[]).reduce(
                        (cavCount, card) => (card.hasTrait('cavalry') ? cavCount + 1 : cavCount),
                        0
                    ),
                match: (card, source) => card === source
            })
        });

        this.action({
            title: 'Move this and another character to the conflict',
            targets: {
                self: {
                    cardType: CardTypes.Character,
                    controller: Players.Self,
                    cardCondition: (card, context) => card === context.source,
                    gameAction: AbilityDsl.actions.moveToConflict()
                },
                optional: {
                    cardType: CardTypes.Character,
                    controller: Players.Self,
                    cardCondition: (card, context) => card !== context.source,
                    optional: true,
                    gameAction: AbilityDsl.actions.moveToConflict()
                }
            },
            effect: 'move {0}{1}{2} into the conflict',
            effectArgs: (context) => [
                context.targets.optional.length !== 0 ? ' and ' : '',
                context.targets.optional.length !== 0 ? context.targets.optional : ''
            ]
        });
    }
}
