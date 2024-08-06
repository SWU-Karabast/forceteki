const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Durations } = require('../../Constants.js');

class NaturalNegotiator extends DrawCard {
    setupCardAbilities() {
        this.attachmentConditions({
            trait: 'courtier',
            myControl: true
        });

        this.action({
            title: 'Switch attached characters base skills',
            effect: 'switch {1}\'s base {2} and {3} skill',
            effectArgs: (context) => [context.source.parent, 'military', 'political'],
            cost: AbilityDsl.costs.giveHonorToOpponent(),
            condition: (context) => context.game.isDuringConflict(),
            gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                duration: Durations.UntilEndOfConflict,
                target: context.source.parent,
                effect: AbilityDsl.effects.switchBaseSkills()
            }))
        });
    }
}

NaturalNegotiator.id = 'natural-negotiator';

module.exports = NaturalNegotiator;
