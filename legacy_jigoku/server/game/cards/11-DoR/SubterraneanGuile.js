const DrawCard = require('../../drawcard.js');
const { CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class SubterraneanGuile extends DrawCard {
    setupCardAbilities() {
        this.whileAttached({
            condition: context => this.game.isDuringConflict('military') && this.isHoldingOnUnbrokenProvince(context),
            effect: AbilityDsl.effects.addKeyword('covert')
        });
    }

    isHoldingOnUnbrokenProvince(context) {
        return context.game.getProvinceArray().some(location => {
            if(!context.player.getProvinceCardInProvince(location).isBroken) {
                let cards = context.player.getDynastyCardsInProvince(location);
                if(cards.some(card => card.isFaceup() && card.type === CardTypes.Holding)) {
                    return true;
                }
            }
            return false;
        });
    }
}

SubterraneanGuile.id = 'subterranean-guile';

module.exports = SubterraneanGuile;
