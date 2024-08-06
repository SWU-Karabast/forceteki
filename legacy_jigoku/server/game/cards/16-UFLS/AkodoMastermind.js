const DrawCard = require('../../drawcard.js');
const { Locations, CardTypes, TargetModes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class AkodoMastermind extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Remove tactics to bow a character',
            condition: context => context.source.isParticipating(),
            cost: AbilityDsl.costs.removeFromGame({
                cardType: [CardTypes.Event, CardTypes.Character, CardTypes.Attachment],
                location: Locations.ConflictDiscardPile,
                mode: TargetModes.Unlimited,
                cardCondition: card => card.hasTrait('tactic')
            }),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card, context) => card.isParticipating() && card.getGlory() <= this.getGloryCheck(context),
                gameAction: AbilityDsl.actions.bow()
            },
            cannotTargetFirst: true
        });
    }

    getGloryCheck(context) {
        if(context.costs.removeFromGame) {
            return context.costs.removeFromGame.length;
        }
        return context.player.conflictDiscardPile.filter(card => card.hasTrait('tactic')).length;
    }
}

AkodoMastermind.id = 'akodo-mastermind';

module.exports = AkodoMastermind;
