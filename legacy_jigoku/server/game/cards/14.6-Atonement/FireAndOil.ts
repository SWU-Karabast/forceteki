import AbilityDsl from '../../abilitydsl';
import { AbilityTypes, CardTypes } from '../../Constants';
import DrawCard from '../../drawcard';
import { ActionProps } from '../../Interfaces';

export default class FireAndOil extends DrawCard {
    static id = 'fire-and-oil';

    setupCardAbilities() {
        this.persistentEffect({
            condition: (context) => !context.player.getProvinceCardInProvince(context.source.location).isBroken,
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Action, {
                title: 'Dishonor a character',
                condition: (context) =>
                    context.game.isDuringConflict() &&
                    context.game.currentConflict &&
                    context.game.currentConflict.getConflictProvinces().some((a) => a.controller === context.player),
                cost: AbilityDsl.costs.payHonor(1),
                target: {
                    cardType: CardTypes.Character,
                    cardCondition: (card) => card.isAttacking(),
                    gameAction: AbilityDsl.actions.dishonor()
                }
            } as ActionProps<this>)
        });
    }
}