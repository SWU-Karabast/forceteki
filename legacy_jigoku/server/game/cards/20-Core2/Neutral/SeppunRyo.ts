import { DuelTypes, Durations, FavorTypes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class SeppunRyo extends DrawCard {
    static id = 'seppun-ryo';

    public setupCardAbilities() {
        this.duelFocus({
            title: 'Help a character with a duel',
            duelCondition: (duel, context) =>
                context.player.imperialFavor !== '' && duel.participants.includes(context.source),
            gameAction: AbilityDsl.actions.duelLastingEffect((context) => ({
                target: (context as any).event.duel,
                effect: AbilityDsl.effects.modifyDuelSkill({ amount: 1, player: context.player }),
                duration: Durations.UntilEndOfDuel
            })),
            effect: 'add 1 to their duel total'
        });

        this.action({
            title: 'Initiate a military duel to bow',
            initiateDuel: {
                type: DuelTypes.Military,
                refuseGameAction: AbilityDsl.actions.claimImperialFavor((context) => ({
                    target: context.player.opponent?.imperialFavor !== '' ? context.player : null,
                    side: this.getFavorSide(context.player.opponent?.imperialFavor)
                })),
                refusalMessage: '{0} chooses to refuse the duel and give the imperial favor to {1}',
                refusalMessageArgs: (context) => [context.player.opponent, context.player],
                gameAction: (duel) => AbilityDsl.actions.bow({ target: duel.loser })
            }
        });
    }

    getFavorSide(favor: string) {
        switch (favor) {
            case 'military':
                return FavorTypes.Military;
            case 'political':
                return FavorTypes.Political;
            default:
                return FavorTypes.Both;
        }
    }
}
