import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BenduDoYouFearTheStorm extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'bendu#do-you-fear-the-storm-id',
            internalName: 'bendu#do-you-fear-the-storm',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addOnAttackAbility({
            title: 'Deal 3 damage to each other unit',
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 3,
                target: context.game.getArenaUnits({ otherThan: context.source })
            })),
        });
    }
}