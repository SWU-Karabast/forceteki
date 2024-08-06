const DrawCard = require('../../drawcard.js');
const { CardTypes, Elements } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

const elementKey = 'katana-of-fire-fire';

class KatanaOfFire extends DrawCard {
    setupCardAbilities() {
        this.whileAttached({
            effect: AbilityDsl.effects.modifyMilitarySkill(() => this.totalKatanaModifier())
        });
    }

    canPlay(context, playType) {
        if(!context.player.cardsInPlay.any(card => card.getType() === CardTypes.Character && card.hasTrait('shugenja'))) {
            return false;
        }

        return super.canPlay(context, playType);
    }

    // Helper methods for clarity - TODO: needs fixing to not use this.controller
    controllerHasFireRing() {
        return this.game.rings[this.getCurrentElementSymbol(elementKey)].isConsideredClaimed(this.controller);
    }
    numberOfFireCards() {
        return this.controller.getNumberOfCardsInPlay(card => card.hasTrait('fire'));
    }
    totalKatanaModifier() {
        var skillModifier = this.controllerHasFireRing() ? 2 : 0;
        skillModifier += this.numberOfFireCards();
        return skillModifier;
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKey,
            prettyName: 'Claimed Ring',
            element: Elements.Fire
        });
        return symbols;
    }
}

KatanaOfFire.id = 'katana-of-fire';

module.exports = KatanaOfFire;
