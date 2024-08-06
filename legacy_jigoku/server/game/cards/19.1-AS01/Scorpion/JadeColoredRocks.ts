import { TargetModes, Players } from '../../../Constants';
import { ProvinceCard } from '../../../ProvinceCard';
import AbilityDsl from '../../../abilitydsl';

export default class JadeColoredRocks extends ProvinceCard {
    static id = 'jade-colored-rocks';

    public setupCardAbilities() {
        this.action({
            title: 'Make your opponent lose a resource',
            target: {
                mode: TargetModes.Select,
                player: Players.Self,
                activePromptTitle: 'Choose an option',
                choices: {
                    'Opponent loses 1 fate': AbilityDsl.actions.loseFate((context) => ({
                        amount: 1,
                        target: context.player.opponent
                    })),
                    'Opponent loses 1 honor': AbilityDsl.actions.loseHonor((context) => ({
                        amount: 1,
                        target: context.player.opponent.honor > 6 ? context.player.opponent : []
                    })),
                    'Opponent discards 1 card at random': AbilityDsl.actions.discardAtRandom((context) => ({
                        amount: 1,
                        target: context.player.opponent
                    }))
                }
            }
        });
    }
}
