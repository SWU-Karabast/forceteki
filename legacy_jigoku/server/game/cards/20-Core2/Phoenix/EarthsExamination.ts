import { CardTypes, ConflictTypes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class EarthsExamination extends DrawCard {
    static id = 'earth-s-examination';

    setupCardAbilities() {
        this.action({
            title: 'Taint a character',
            condition: (context) =>
                context.game.isDuringConflict(ConflictTypes.Political) && context.player.isTraitInPlay('shugenja'),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isParticipating(),
                gameAction: AbilityDsl.actions.multiple([
                    AbilityDsl.actions.taint(),
                    AbilityDsl.actions.onAffinity((context) => ({
                        trait: 'earth',
                        promptTitleForConfirmingAffinity: context.target.isTainted ? undefined : 'Bow that character?',
                        gameAction: AbilityDsl.actions.bow(),
                        effect: 'bow {0}',
                        effectArgs: (context) => [context.target]
                    }))
                ])
            },
            effect: "reveal {1}'s corruption",
            effectArgs: (context) => [context.target]
        });
    }
}
