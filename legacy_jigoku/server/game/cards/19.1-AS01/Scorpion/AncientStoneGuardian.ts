import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';
import { CardTypes, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';
import { SequentialContextProperties } from '../../../GameActions/SequentialContextAction';
import type { TriggeredAbilityContext } from '../../../TriggeredAbilityContext';

export default class AncientStoneGuardian extends DrawCard {
    static id = 'ancient-stone-guardian';

    public setupCardAbilities() {
        this.persistentEffect({
            effect: [AbilityDsl.effects.cardCannot('declareAsAttacker')]
        });

        this.persistentEffect({
            effect: AbilityDsl.effects.cardCannot({ cannot: 'applyCovert', restricts: 'opponentsCardEffects' })
        });

        this.forcedInterrupt({
            title: 'Dishonor a character and draw a card',
            when: {
                onCardLeavesPlay: (event, context) => event.card === context.source
            },
            targets: {
                firstCharacter: {
                    activePromptTitle: 'Choose a character',
                    cardType: CardTypes.Character,
                    optional: true,
                    hideIfNoLegalTargets: true,
                    controller: (context) => (context.player.firstPlayer ? Players.Self : Players.Opponent),
                    player: (context) => (context.player.firstPlayer ? Players.Self : Players.Opponent),
                    cardCondition: (card, context) => this.cardCanBeChosenForDishonor(card, context),
                    gameAction: AbilityDsl.actions.sequentialContext((context) =>
                        this.dishonorAndDraw(context.targets.firstCharacter)
                    )
                },
                secondCharacter: {
                    activePromptTitle: 'Choose a character',
                    cardType: CardTypes.Character,
                    optional: true,
                    hideIfNoLegalTargets: true,
                    controller: (context) => (context.player.firstPlayer ? Players.Opponent : Players.Self),
                    player: (context) => (context.player.firstPlayer ? Players.Opponent : Players.Self),
                    cardCondition: (card, context) => this.cardCanBeChosenForDishonor(card, context),
                    gameAction: AbilityDsl.actions.sequentialContext((context) =>
                        this.dishonorAndDraw(context.targets.secondCharacter)
                    )
                }
            },

            effect: 'present an opportunity to sneak around {0} and find some secrets!{1}{2}{3}{4}{5}{6}{7}{8}{9}{10}',
            effectArgs: (context) =>
                this.effectsForCard(context.targets.firstCharacter).concat(
                    this.effectsForCard(context.targets.secondCharacter)
                )
        });
    }

    private cardCanBeChosenForDishonor(card: BaseCard, context: TriggeredAbilityContext): boolean {
        return card !== context.source && AbilityDsl.actions.dishonor({ target: card }).canAffect(card, context);
    }

    private dishonorAndDraw(target?: BaseCard): SequentialContextProperties {
        return {
            gameActions: target
                ? [
                      AbilityDsl.actions.dishonor({ target: target }),
                      AbilityDsl.actions.draw({ target: target.controller })
                  ]
                : []
        };
    }

    private effectsForCard(target?: BaseCard | []) {
        if (target instanceof DrawCard) {
            // Target selected
            return [' ', target.controller, ' dishonors ', target, ' to draw a card.'];
        }
        // Target skipped
        return ['', '', '', '', ''];
    }
}