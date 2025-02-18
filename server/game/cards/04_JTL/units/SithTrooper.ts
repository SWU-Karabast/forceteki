import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class SithTrooper extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5751831621',
            internalName: 'red-squadron-xwing',
        };
    }

    public override setupCardAbilities () {
        this.addOnAttackAbility({
            title: 'This unit gets +1/+0 for this attack for each damaged unit the defending player controls',
            immediateEffect: AbilityHelper.immediateEffects.forThisAttackCardEffect((context) => ({
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: this.countDamagedUnits(context), hp: 0 }),
            }))
        });
    }
}
