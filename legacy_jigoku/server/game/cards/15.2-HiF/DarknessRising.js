const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class DarknessRising extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Bow weaker military characters',
            condition: context => context.game.isDuringConflict(),
            cost: AbilityDsl.costs.dishonor({ cardCondition: (card, context) => card.isParticipating() && this.getLegalTargetsForCard(card, context).length > 0 }),
            cannotTargetFirst: true,
            gameAction: AbilityDsl.actions.bow(context => ({
                target: this.getLegalTargetsForCard(context.costs.dishonor, context)
            }))
        });
    }

    isTemptationsMaho() {
        return true;
    }

    getLegalTargetsForCard(card, context) {
        let targets = context.game.currentConflict.getParticipants().filter(c => !card || (c.getMilitarySkill() < card.getMilitarySkill() && c.allowGameAction('bow', context)));
        return targets;
    }
}

DarknessRising.id = 'darkness-rising';

module.exports = DarknessRising;
