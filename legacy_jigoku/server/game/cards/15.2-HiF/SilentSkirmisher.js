const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes, Durations } = require('../../Constants');

class SilentSkirmisher extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Sacrifice another for +2 military',
            condition: context => context.game.isDuringConflict(),
            cost: AbilityDsl.costs.sacrifice({
                cardType: CardTypes.Character,
                cardCondition: (card, context) => card !== context.source
            }),
            effect: 'give itself +2{1}',
            effectArgs: () => ['military'],
            gameAction: AbilityDsl.actions.cardLastingEffect(context => ({
                duration: Durations.UntilEndOfConflict,
                target: context.source,
                effect: AbilityDsl.effects.modifyMilitarySkill(2)
            }))
        });
    }
}

SilentSkirmisher.id = 'silent-skirmisher';

module.exports = SilentSkirmisher;

