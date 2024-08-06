import { CardTypes } from '../../../Constants';
import AbilityDsl = require('../../../abilitydsl');
import BaseCard = require('../../../basecard');
import DrawCard = require('../../../drawcard');

export default class ProtectedMerchant extends DrawCard {
    static id = 'protected-merchant';

    public setupCardAbilities() {
        this.persistentEffect({
            effect: AbilityDsl.effects.modifyGlory(() => Math.min(2, this.getHoldingsInPlay()))
        });
    }

    private getHoldingsInPlay(): number {
        return (this.game.allCards as BaseCard[]).reduce(
            (sum, card) =>
                card.type === CardTypes.Holding &&
                card.controller === this.controller &&
                card.isFaceup() &&
                card.isInProvince()
                    ? sum + 1
                    : sum,
            0
        );
    }
}
