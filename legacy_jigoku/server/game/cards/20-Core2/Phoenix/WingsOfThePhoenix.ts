import { CardTypes, Durations, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class WingsOfThePhoenix extends DrawCard {
    static id = 'wings-of-the-phoenix';

    setupCardAbilities() {
        this.action({
            title: 'Move a character',
            condition: (context) =>
                context.game.isDuringConflict() &&
                context.player.cardsInPlay.some((card: DrawCard) => card.hasTrait('shugenja')),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                gameAction: AbilityDsl.actions.multiple([
                    AbilityDsl.actions.sendHome(),
                    AbilityDsl.actions.moveToConflict(),
                    AbilityDsl.actions.onAffinity({
                        trait: 'fire',
                        gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                            target: context.game.currentConflict.getCharacters(context.player.opponent),
                            effect: AbilityDsl.effects.modifyBothSkills(-1),
                            duration: Durations.UntilEndOfConflict
                        })),
                        effect: 'give all participating enemies -1{1}/-1{2} until the end of the conflict',
                        effectArgs: ['military', 'political']
                    })
                ])
            }
        });
    }
}
