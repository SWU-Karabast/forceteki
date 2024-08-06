const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');
const { CardTypes, Players } = require('../../Constants');

class WatchtowerOfSunsShadow extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => {
                if(!context.player.isDefendingPlayer()) {
                    return false;
                }
                let cardsInProvinces = [];
                context.game.currentConflict.getConflictProvinces().forEach(p => {
                    cardsInProvinces = cardsInProvinces.concat(context.player.getDynastyCardsInProvince(p.location));
                });
                return cardsInProvinces.some(card => card.isFaceup() && card.type === CardTypes.Holding && card.hasTrait('kaiu-wall'));
            },
            targetController: Players.Opponent,
            match: (card) => card.isAttacking(),
            effect: AbilityDsl.effects.modifyBothSkills(card => -card.getFate())
        });

        this.forcedInterrupt({
            title: 'Lose 2 fate',
            when: {
                onBreakProvince: (event, context) => event.card.controller === context.player && event.card.location === context.source.location
            },
            gameAction: AbilityDsl.actions.loseFate(context => ({
                amount: 2,
                target: context.player
            }))
        });
    }
}

WatchtowerOfSunsShadow.id = 'watchtower-of-sun-s-shadow';

module.exports = WatchtowerOfSunsShadow;
