import { DuelTypes, Durations } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class DaidojiAkikore extends DrawCard {
    static id = 'daidoji-akikore';

    setupCardAbilities() {
        this.duelFocus({
            title: 'Add +1 to your duel total',
            duelCondition: (duel, context) =>
                context.game.isDuringConflict('political') && duel.participants.includes(context.source),
            gameAction: AbilityDsl.actions.duelLastingEffect((context) => ({
                target: (context as any).event.duel,
                effect: AbilityDsl.effects.modifyDuelSkill({ amount: 1, player: context.player }),
                duration: Durations.UntilEndOfDuel
            })),
            effect: 'add 1 to their duel total'
        });

        this.action({
            title: 'Military duel to add skill',
            initiateDuel: (context) => ({
                type: DuelTypes.Military,
                opponentChoosesDuelTarget: true,
                challengerCondition: (card, context) => context.game.isDuringConflict(),
                message: '{0}{1}{2}',
                messageArgs: (duel) =>
                    duel.winningPlayer === context.player
                        ? ['add 3 to ', context.player, "'s side for this conflict"]
                        : ['no effect', '', ''],
                gameAction: (duel) =>
                    AbilityDsl.actions.conditional({
                        condition: duel.winningPlayer === context.player,
                        trueGameAction: AbilityDsl.actions.playerLastingEffect((context) => ({
                            targetController: duel.winningPlayer,
                            effect: AbilityDsl.effects.changePlayerSkillModifier(3)
                        })),
                        falseGameAction: AbilityDsl.actions.noAction()
                    })
            })
        });
    }
}
