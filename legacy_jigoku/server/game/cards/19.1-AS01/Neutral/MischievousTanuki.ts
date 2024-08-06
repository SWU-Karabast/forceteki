import { Phases } from '../../../Constants';
import AbilityDsl = require('../../../abilitydsl');
import DrawCard = require('../../../drawcard');

export default class MischievousTanuki extends DrawCard {
    static id = 'mischievous-tanuki';

    public setupCardAbilities() {
        this.legendary(0);

        this.action({
            title: 'Set honor dials',
            phase: Phases.Conflict,
            gameAction: AbilityDsl.actions.honorBid({
                message: '{0}{1}{2}{3}',
                messageArgs: (context) => {
                    if (context.player.showBid % 2 === context.player.opponent.showBid % 2) {
                        return [context.player, ' takes 2 fate from ', context.player.opponent, ''];
                    } else if (context.player.showBid % 2 === 0) {
                        return [context.player, ' gains 2 honor and ', context.player.opponent, ' draws 2 cards'];
                    }
                    return [context.player, ' draws 2 cards and ', context.player.opponent, ' gains 2 honor'];
                },
                postBidAction: AbilityDsl.actions.conditional({
                    condition: (context) => {
                        return context.player.showBid % 2 === context.player.opponent.showBid % 2;
                    },
                    trueGameAction: AbilityDsl.actions.takeFate((context) => ({
                        target: context.player.opponent,
                        amount: 2
                    })),
                    falseGameAction: AbilityDsl.actions.multiple([
                        AbilityDsl.actions.draw((context) => ({
                            target: context.player.showBid % 2 === 1 ? context.player : context.player.opponent,
                            amount: 2
                        })),
                        AbilityDsl.actions.gainHonor((context) => ({
                            target: context.player.showBid % 2 === 0 ? context.player : context.player.opponent,
                            amount: 2
                        }))
                    ])
                })
            }),
            effect: 'play a game!'
        });
    }
}
