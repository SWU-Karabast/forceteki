import AbilityDsl from '../../abilitydsl';
import { CardTypes, Players } from '../../Constants';
import DrawCard from '../../drawcard';
import type { TriggeredAbilityContext } from '../../TriggeredAbilityContext';

export default class BetrayedVision extends DrawCard {
    static id = 'betrayed-vision';

    setupCardAbilities() {
        this.action({
            title: 'Make a character a copy',
            condition: (context) => context.game.isDuringConflict(),
            targets: {
                cardToCopy: {
                    activePromptTitle: 'Choose a character to copy',
                    cardType: CardTypes.Character,
                    controller: Players.Any,
                    cardCondition: (card) => !card.isUnique()
                },
                myCharacter: {
                    dependsOn: 'cardToCopy',
                    activePromptTitle: 'Choose a character to turn into the copy',
                    cardType: CardTypes.Character,
                    controller: Players.Opponent,
                    cardCondition: (card, context) => card.isParticipating() && card !== context.targets.cardToCopy,
                    gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                        effect: AbilityDsl.effects.copyCard(context.targets.cardToCopy)
                    }))
                }
            },
            effect: 'make {1} into a copy of {2}',
            effectArgs: (context) => [context.targets.myCharacter, context.targets.cardToCopy]
        });
    }

    canPlay(context: TriggeredAbilityContext, playType: string) {
        return (
            context.player.cardsInPlay.any(
                (card) => card.getType() === CardTypes.Character && card.hasTrait('shugenja')
            ) && super.canPlay(context, playType)
        );
    }
}
