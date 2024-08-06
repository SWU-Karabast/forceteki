import { AbilityContext } from '../../../AbilityContext';
import { CardTypes, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class BakeKujira extends DrawCard {
    static id = 'bake-kujira';

    setupCardAbilities() {
        this.legendary(1);

        this.reaction({
            title: 'Eat a character',
            when: {
                afterConflict: (event, context) =>
                    event.conflict.winner === context.source.controller && context.source.isParticipating()
            },
            target: {
                cardType: CardTypes.Character,
                controller: Players.Any,
                cardCondition: (card, context) => card.isParticipating() && card !== context.source,
                gameAction: AbilityDsl.actions.conditional({
                    condition: (context) => this.#shouldDiscardTarget(context),
                    trueGameAction: AbilityDsl.actions.discardFromPlay(),
                    falseGameAction: AbilityDsl.actions.removeFate()
                })
            }
        });
    }

    #shouldDiscardTarget(context: AbilityContext): boolean {
        return context.target.getFate() === 0;
    }
}
