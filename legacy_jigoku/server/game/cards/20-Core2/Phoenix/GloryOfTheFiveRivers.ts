import { AbilityContext } from '../../../AbilityContext';
import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';
import { FateBidPrompt, Result } from '../../../gamesteps/FateBidPrompt';
import { SimpleStep } from '../../../gamesteps/SimpleStep';
import Player from '../../../player';

function resolveActionOnSelection(context: AbilityContext, player: Player, action: 'honor' | 'dishonor') {
    const playerEnum = player === context.player ? Players.Self : Players.Opponent;
    AbilityDsl.actions
        .selectCard({
            player: playerEnum,
            controller: playerEnum,
            cardType: CardTypes.Character,
            gameAction: action === 'honor' ? AbilityDsl.actions.honor() : AbilityDsl.actions.dishonor(),
            message: `{0} ${action}s {1}`,
            messageArgs: (card, player) => [player, card]
        })
        .resolve(player, context);
}

export default class GloryOfTheFiveRivers extends DrawCard {
    static id = 'glory-of-the-five-rivers';

    public setupCardAbilities() {
        this.action({
            title: 'Honor a character and dishonor a character',
            condition: (context) => context.player.isTraitInPlay('courtier'),
            gameAction: AbilityDsl.actions.handler({
                handler: (context) => {
                    let bidResult: Result;

                    context.game.queueStep(
                        new FateBidPrompt(context.game, 'Choose an amount of fate', (result, context) => {
                            bidResult = result;
                            for (const [player, amount] of result.bids) {
                                context.game.addMessage('{0} spends {1} fate', player, amount);
                                AbilityDsl.actions.loseFate({ amount, target: player }).resolve(player, context);
                            }
                        })
                    );

                    context.game.queueStep(
                        new SimpleStep(context.game, () => {
                            for (const winner of bidResult.highest.players) {
                                resolveActionOnSelection(context, winner, 'honor');
                            }

                            for (const loser of bidResult.lowest.players) {
                                resolveActionOnSelection(context, loser, 'dishonor');
                            }
                        })
                    );
                }
            }),
            effect: 'collect offerings'
        });
    }
}
