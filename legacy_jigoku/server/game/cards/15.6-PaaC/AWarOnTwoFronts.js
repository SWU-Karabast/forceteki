const DrawCard = require('../../drawcard.js');
const { Locations, CardTypes, Durations, ConflictTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class AWarOnTwoFronts extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Attack a second province',
            when: {
                onConflictDeclared: (event, context) => event.conflict.attackingPlayer === context.player && event.conflict.conflictType === ConflictTypes.Military && context.player.isMoreHonorable()
            },
            target: {
                cardType: CardTypes.Province,
                location: Locations.Provinces,
                cardCondition: (card, context) => !card.isConflictProvince() && card.canBeAttacked() && context.game.currentConflict.getConflictProvinces().some(a => a.controller === card.controller),
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.reveal(),
                    AbilityDsl.actions.conflictLastingEffect(context => ({
                        duration: Durations.UntilEndOfConflict,
                        effect: AbilityDsl.effects.additionalAttackedProvince(context.target)
                    }))
                ])
            },
            effect: '{2}also attack {1} this conflict!',
            effectArgs: context => [context.target, context.target.isFacedown() ? 'reveal and ' : '']
        });
    }
}

AWarOnTwoFronts.id = 'a-war-on-two-fronts';

module.exports = AWarOnTwoFronts;

