import { DuelTypes, Durations } from '../../../Constants';
import { Duel } from '../../../Duel';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class UnyieldingTerms extends DrawCard {
    static id = 'unyielding-terms';

    setupCardAbilities() {
        this.action({
            title: 'Initiate a political duel',
            initiateDuel: {
                type: DuelTypes.Political,
                requiresConflict: false,
                refuseGameAction: AbilityDsl.actions.chosenDiscard((context) => ({
                    targets: false,
                    target: context.player.opponent,
                    amount: Math.floor(context.player.opponent.hand.value().length / 2)
                })),
                refusalMessage: '{0} chooses to refuse the duel and discard {1} cards from their hand',
                refusalMessageArgs: (context) => [
                    context.player.opponent,
                    Math.floor(context.player.opponent.hand.value().length / 2)
                ],
                gameAction: (duel) =>
                    AbilityDsl.actions.multiple([
                        AbilityDsl.actions.bow({ target: duel.loser }),
                        AbilityDsl.actions.removeFate({ target: this.wonByDuelist(duel) ? duel.loser : undefined })
                    ]),
                message: 'bow{1} {0}',
                messageArgs: (duel) => [duel.loser, this.wonByDuelist(duel) ? ' and remove 1 fate from' : ''],
            },
            max: AbilityDsl.limit.perRound(1)
        });
    }

    wonByDuelist(duel: Duel): boolean {
        return duel.winner?.some((char) => char.hasTrait('duelist')) ?? false;
    }
}
