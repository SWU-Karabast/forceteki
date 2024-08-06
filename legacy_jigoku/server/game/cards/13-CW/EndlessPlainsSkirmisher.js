const DrawCard = require('../../drawcard.js');
const { TargetModes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class EndlessPlainsSkirmisher extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Move this character to the confict',
            target: {
                mode: TargetModes.Select,
                targets: true,
                activePromptTitle: 'Which side should this character be on?',
                choices: {
                    [this.owner.name]: AbilityDsl.actions.moveToConflict({ side: this.owner }),
                    [this.owner.opponent && this.owner.opponent.name || 'NA']: AbilityDsl.actions.moveToConflict({ side: this.owner.opponent })
                }
            },
            effect: 'join the conflict for {1}!',
            effectArgs: context => this.getEffectArg(context, context.select)
        });
    }

    getEffectArg(context, selection) {
        if(selection === context.player.name) {
            return context.player;
        }
        return context.player.opponent;
    }
}

EndlessPlainsSkirmisher.id = 'endless-plains-skirmisher';

module.exports = EndlessPlainsSkirmisher;
