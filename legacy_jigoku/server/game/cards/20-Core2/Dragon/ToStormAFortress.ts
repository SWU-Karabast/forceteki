import { CardTypes, Players, ConflictTypes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import { Conflict } from '../../../conflict';

export default class ToStormAFortress extends DrawCard {
    static id = 'to-storm-a-fortress';

    public setupCardAbilities() {
        this.action({
            title: "Increase a character's military skill",
            condition: (context) => context.game.isDuringConflict(ConflictTypes.Military),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: (card) => card.isParticipating() && card.hasSomeTrait('bushi', 'monk'),
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.cardLastingEffect(() => ({
                        effect: AbilityDsl.effects.modifyMilitarySkill(2)
                    })),
                    AbilityDsl.actions.menuPrompt((context) => ({
                        activePromptTitle: 'Discard each card in the attacked province?',
                        choices: ['Yes', 'No'],
                        choiceHandler: (choice, displayMessage) => {
                            const cardsToDiscard = (context.game.currentConflict as Conflict)
                                .getConflictProvinces()
                                .flatMap((province) =>
                                    province.controller.getDynastyCardsInProvince(province.location)
                                );

                            if (displayMessage && choice === 'Yes') {
                                context.game.addMessage(
                                    "{0}'s {1} discards {2}",
                                    context.player,
                                    context.source,
                                    cardsToDiscard
                                );
                            }
                            return { target: choice === 'Yes' ? cardsToDiscard : [] };
                        },
                        gameAction: AbilityDsl.actions.discardCard()
                    }))
                ])
            },
            effect: 'grant +2{1} to {0}',
            effectArgs: ['military']
        });
    }
}