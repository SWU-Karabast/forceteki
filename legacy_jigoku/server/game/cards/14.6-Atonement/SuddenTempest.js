const DrawCard = require('../../drawcard.js');
const { TargetModes, Durations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class SuddenTempest extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Remove a ring from the unclaimd ring pool',
            target: {
                mode: TargetModes.Ring,
                ringCondition: ring => ring.isUnclaimed(),
                gameAction: AbilityDsl.actions.multiple([
                    AbilityDsl.actions.removeRingFromPlay(),
                    AbilityDsl.actions.ringLastingEffect(context => ({
                        duration: Durations.Custom,
                        until: {
                            onBeginRound: () => true
                        },
                        target: context.ring.getElements().map(element => this.game.rings[element]),
                        effect: AbilityDsl.effects.delayedEffect({
                            when: {
                                onRoundEnded: () => true
                            },
                            target: context.ring.getElements().map(element => this.game.rings[element]),
                            gameAction: AbilityDsl.actions.returnRingToPlay()
                        })
                    }))
                ])
            },
            effect: 'remove the {0} from the unclaimed ring pool until the end of the round'
        });
    }
}

SuddenTempest.id = 'sudden-tempest';

module.exports = SuddenTempest;
