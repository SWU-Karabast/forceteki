import { DuelTypes, Players } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class KakitaKaezin extends DrawCard {
    static id = 'kakita-kaezin';

    setupCardAbilities() {
        this.action({
            title: 'Duel an opposing character',
            condition: (context) => context.source.isParticipating(),
            target: {
                player: Players.Opponent,
                activePromptTitle: 'Choose a character to duel with Kaezin',
                controller: Players.Opponent,
                cardCondition: (card) => card.isParticipating(),
                gameAction: AbilityDsl.actions.duel((context) => ({
                    type: DuelTypes.Military,
                    challenger: context.source,
                    gameAction: (duel) =>
                        AbilityDsl.actions.sendHome({
                            target:
                                duel.winner?.includes(context.source) ?? false
                                    ? context.game.currentConflict.getParticipants(
                                          (card: DrawCard) => !duel.isInvolved(card)
                                      )
                                    : duel.loser
                        })
                }))
            }
        });
    }
}
