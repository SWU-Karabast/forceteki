import { AbilityContext } from '../../../AbilityContext';
import { CardTypes, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import type { Conflict } from '../../../conflict';

function shinobiCount(context: AbilityContext): number {
    return (
        (context.game.currentConflict as Conflict | null)?.getParticipants(
            (card: DrawCard) => card.controller === context.player && card.hasTrait('shinobi')
        )?.length ?? 0
    );
}

export default class SpiderwebPassage extends DrawCard {
    static id = 'spiderweb-passage';

    setupCardAbilities() {
        this.action({
            title: 'Discard a participating character with 0 skill',
            condition: (context) => shinobiCount(context) > 0,
            cost: AbilityDsl.costs.sacrificeSelf(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Opponent,
                cardCondition: (card: DrawCard) =>
                    card.isParticipating() &&
                    ((!card.hasDash('political') && card.getPoliticalSkill() === 0) ||
                        (!card.hasDash('military') && card.getMilitarySkill() === 0))
            },
            gameAction: AbilityDsl.actions.conditional((context) => {
                const discardCount = shinobiCount(context);
                const discardFromHandAction = AbilityDsl.actions.discardAtRandom({
                    amount: discardCount,
                    target: context.player.opponent
                });
                const killAction = AbilityDsl.actions.discardFromPlay({ target: context.target });

                return {
                    condition: () =>
                        context.player.opponent.hand.size() >= discardCount &&
                        discardFromHandAction.canAffect(context.player.opponent, context),
                    falseGameAction: killAction,
                    trueGameAction: AbilityDsl.actions.chooseAction((context) => ({
                        player: Players.Opponent,
                        activePromptTitle: 'Select one',
                        options: {
                            [`Discard ${discardCount} random cards from hand`]: {
                                action: discardFromHandAction,
                                message: '{0} distracts the Shinobi'
                            },
                            [`Discard ${context.target.name}`]: {
                                action: killAction,
                                message: `{0} refuses to discard ${discardCount} cards. {2} is discarded`
                            }
                        },
                        messageArgs: [context.target]
                    }))
                };
            }),
            effect: 'ambush {1}',
            effectArgs: (context) => context.target
        });
    }
}
