const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');
const { Durations, Players } = require('../../Constants');

class MountaintopVigil extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'cancel all ring effects',
            effect: 'cancel all ring effects until the end of the conflict',
            condition: () => this.game.isDuringConflict(),
            gameAction: AbilityDsl.actions.playerLastingEffect({
                duration: Durations.UntilEndOfConflict,
                targetController: Players.Any,
                effect: AbilityDsl.effects.cannotResolveRings()
            })
        });
    }
}

MountaintopVigil.id = 'mountaintop-vigil';

module.exports = MountaintopVigil;
