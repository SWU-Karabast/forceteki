import { DuelTypes, Players } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';
import type Player from '../../player';

export default class TaoistAdept extends DrawCard {
    static id = 'taoist-adept';

    setupCardAbilities() {
        this.action({
            title: 'Initiate a military duel',
            initiateDuel: {
                type: DuelTypes.Military,
                message: 'choose whether to place a fate on a ring',
                gameAction: (duel) =>
                    AbilityDsl.actions.selectRing((context) => ({
                        activePromptTitle: 'Choose a ring to receive a fate',
                        player: duel.winnerController === context.player ? Players.Self : Players.Opponent,
                        message: '{0} places a fate on the {1}',
                        messageArgs: (ring, player) => [player, ring],
                        ringCondition: (ring) => duel.winner && ring.isUnclaimed(),
                        gameAction: AbilityDsl.actions.placeFateOnRing(),
                        optional: true,
                        onMenuCommand: (player: Player, arg: string) => {
                            if (arg === 'done') {
                                this.game.addMessage(player.name + ' chooses not to place a fate on a ring');
                            }
                            return true;
                        }
                    }))
            }
        });
    }
}
