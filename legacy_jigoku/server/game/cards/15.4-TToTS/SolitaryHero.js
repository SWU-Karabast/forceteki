const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class SolitaryHero extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            effect: AbilityDsl.effects.cardCannot({
                cannot: 'applyCovert',
                restricts: 'opponentsCardEffects'
            })
        });

        this.action({
            title: 'Remove a fate from weaker military characters',
            condition: context =>
                context.source.isParticipatingFor(context.player) &&
                context.game.currentConflict.getNumberOfParticipantsFor(context.player) === 1,
            gameAction: AbilityDsl.actions.removeFate(context => ({
                target: context.game.currentConflict.getParticipants(card => card.getMilitarySkill() <= context.source.getMilitarySkill() && card !== context.source),
                amount: 1
            }))
        });
    }
}

SolitaryHero.id = 'solitary-hero';

module.exports = SolitaryHero;
