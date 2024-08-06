import AbilityDsl from '../../abilitydsl';
import { CardTypes, Locations, Players } from '../../Constants';
import DrawCard from '../../drawcard';
import type { TriggeredAbilityContext } from '../../TriggeredAbilityContext';

export default class MiyakosUndertaking extends DrawCard {
    static id = 'miyako-s-undertaking';

    setupCardAbilities() {
        this.action({
            title: 'Make a character a copy',
            condition: (context) => context.game.isDuringConflict(),
            targets: {
                cardToCopy: {
                    cardType: CardTypes.Character,
                    controller: Players.Opponent,
                    location: Locations.DynastyDiscardPile,
                    cardCondition: (card) => !card.isUnique()
                },
                myCharacter: {
                    dependsOn: 'cardToCopy',
                    cardType: CardTypes.Character,
                    controller: Players.Self,
                    cardCondition: (card) => card.isParticipating(),
                    gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                        effect: AbilityDsl.effects.copyCard(context.targets.cardToCopy)
                    }))
                }
            },
            effect: 'make {1} into a copy of {2}',
            effectArgs: (context) => [context.targets.myCharacter, context.targets.cardToCopy]
        });
    }

    canPlay(context: TriggeredAbilityContext) {
        return context.player.honor <= 6 && super.canPlay(context);
    }
}
