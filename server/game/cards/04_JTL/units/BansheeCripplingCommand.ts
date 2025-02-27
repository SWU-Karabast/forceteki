import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class BansheeCripplingCommand extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6390089966',
            internalName: 'banshee#crippling-command',
        };
    }

    public override setupCardAbilities () {
        this.addOnAttackAbility({
            title: 'Deal damage to a unit equal to the amount of damage on this unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: context.source.damage
                }))
            }
        });
    }
}
