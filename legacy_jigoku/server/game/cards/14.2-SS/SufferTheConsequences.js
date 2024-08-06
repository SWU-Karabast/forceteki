const DrawCard = require('../../drawcard.js');
const { Phases, CardTypes, ConflictTypes, Durations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

const validSacrificeTraits = ['courtier', 'bushi', 'shugenja'];

class SufferTheConsequences extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Gain another political conflict',
            effect: 'allow {1} to declare an additional political conflict this phase',
            effectArgs: context => [context.player],
            max: AbilityDsl.limit.perPhase(1),
            condition: context => context.game.currentPhase === Phases.Conflict,
            cost: AbilityDsl.costs.sacrifice({
                cardType: CardTypes.Character,
                cardCondition: card => card.traits.some(trait => validSacrificeTraits.includes(trait)) && card.bowed
            }),
            gameAction: AbilityDsl.actions.playerLastingEffect(context => ({
                targetController: context.player,
                duration: Durations.UntilEndOfPhase,
                effect: AbilityDsl.effects.additionalConflict(ConflictTypes.Political)
            }))
        });
    }
}

SufferTheConsequences.id = 'suffer-the-consequences';

module.exports = SufferTheConsequences;
