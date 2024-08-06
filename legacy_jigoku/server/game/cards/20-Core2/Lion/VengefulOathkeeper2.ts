import { Locations } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class VengefulOathkeeper2 extends DrawCard {
    static id = 'vengeful-oathkeeper-2';

    setupCardAbilities() {
        this.reaction({
            title: 'Put this into play',
            when: {
                afterConflict: (event, context) =>
                    event.conflict.attackingPlayer === context.player.opponent &&
                    event.conflict.winner === context.player.opponent
            },
            location: Locations.Hand,
            gameAction: AbilityDsl.actions.putIntoPlay()
        });
    }
}
