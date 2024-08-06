const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Durations } = require('../../Constants');

class SuperiorAuthority extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Stop characters with 0 fate from contributing skill',
            condition: () => this.game.isDuringConflict(),
            gameAction: AbilityDsl.actions.conflictLastingEffect(context => ({
                duration: Durations.UntilEndOfConflict,
                effect: AbilityDsl.effects.cannotContribute(() => {
                    return card => card.getFate() === 0 && card.checkRestrictions('', context);
                })
            })),
            effect: 'make it so that participating characters with 0 fate cannot contribute skill to conflict resolution'
        });
    }
}

SuperiorAuthority.id = 'superior-authority';

module.exports = SuperiorAuthority;
