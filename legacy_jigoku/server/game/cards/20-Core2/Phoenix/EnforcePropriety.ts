import { CardTypes, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import type Player from '../../../player';

function countReadyShugenja(player: Player): number {
    return player.cardsInPlay.reduce(
        (sum: number, card: DrawCard) => (!card.bowed && card.hasTrait('shugenja') ? sum + 1 : sum),
        0
    );
}

export default class EnforcePropriety extends DrawCard {
    static id = 'enforce-propriety';

    setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Cancel an event',
            when: {
                onInitiateAbilityEffects: (event, context) =>
                    event.card.type === CardTypes.Event &&
                    context.player.opponent &&
                    countReadyShugenja(context.player) > countReadyShugenja(context.player.opponent)
            },

            gameAction: AbilityDsl.actions.chooseAction((context) => ({
                player: Players.Opponent,
                activePromptTitle: 'Select one',
                options: {
                    [`Give 1 fate to ${context.player.name}`]: {
                        action: AbilityDsl.actions.takeFate({ amount: 1, target: context.player.opponent }),
                        message: '{0} gives 1 fate to {2} - the fortunes will be appeased, order is maintained'
                    },
                    'Let the effects be canceled': {
                        action: AbilityDsl.actions.cancel(),
                        message: '{0} refuses to appease the fortunes - the effects of {3} are canceled'
                    }
                },
                messageArgs: [context.player, (context as any).event.card]
            })),
            effect: 'enforce the proper protocol'
        });
    }
}
