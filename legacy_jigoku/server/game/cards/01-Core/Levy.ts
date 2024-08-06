import { Players, TargetModes } from '../../Constants';
import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class Levy extends DrawCard {
    static id = 'levy';

    public setupCardAbilities() {
        this.action({
            title: 'Take an honor or a fate from your opponent',
            condition: (context) => context.player.opponent !== undefined,
            target: {
                player: Players.Opponent,
                mode: TargetModes.Select,
                choices: {
                    'Give your opponent 1 fate': AbilityDsl.actions.takeFate(),
                    'Give your opponent 1 honor': AbilityDsl.actions.takeHonor()
                }
            }
        });
    }
}
