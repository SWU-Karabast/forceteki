import { CardTypes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class MasterOfBindings extends DrawCard {
    static id = 'master-of-bindings';

    public setupCardAbilities() {
        this.reaction({
            title: 'Bow a character that just readied',
            when: {
                onCardReadied: ({ card }, context) =>
                    card.type === CardTypes.Character &&
                    card.controller === context.player.opponent &&
                    (card as DrawCard).printedCost <= 3
            },
            gameAction: AbilityDsl.actions.bow((context) => ({ target: (context as any).event.card }))
        });
    }
}
