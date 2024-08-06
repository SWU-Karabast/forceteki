import { Players, TargetModes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import type Ring from '../../../ring';

export default class RightsOfTheChallenged extends DrawCard {
    static id = 'rights-of-the-challenged';

    public setupCardAbilities() {
        this.reaction({
            title: 'Force attacker to attack with another ring',
            when: {
                onConflictStarted: (_, context) => context.player.isDefendingPlayer()
            },
            target: {
                mode: TargetModes.Ring,
                activePromptTitle: 'Choose a ring to use instead',
                player: Players.Opponent,
                ringCondition: (ring: Ring) => ring.isUnclaimed() && !ring.isRemovedFromGame(),
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.placeFateOnRing((context) => ({
                        origin: context.ring,
                        target: context.game.currentConflict.ring,
                        amount: context.ring.fate
                    })),
                    AbilityDsl.actions.switchConflictElement()
                ])
            },
            effect: 'move all fate from the {0} and switch it with the contested ring'
        });
    }
}
