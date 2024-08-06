const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');
const { CardTypes, Phases } = require('../../Constants.js');

class CommanderOfTheLegions extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            match: (card, context) => card.isFaction('lion')
            && card !== context.source
            && card.controller === context.player,
            effect: AbilityDsl.effects.modifyMilitarySkill(1)
        });

        this.persistentEffect({
            condition: context =>
                context.game.currentPhase === Phases.Fate && context.player.opponent
                && context.player.honor >= context.player.opponent.honor + 5,
            match: (card, context) =>
                card.type === CardTypes.Character
                && card.isFaction('lion')
                && card.printedCost <= 3
                && card !== context.source
                && card.controller === context.player,
            effect: AbilityDsl.effects.cardCannot('removeFate')
        });
    }
}

CommanderOfTheLegions.id = 'commander-of-the-legions';

module.exports = CommanderOfTheLegions;
