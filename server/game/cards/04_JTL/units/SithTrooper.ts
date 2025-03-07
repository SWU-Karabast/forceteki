import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class SithTrooper extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2922063712',
            internalName: 'sith-trooper'
        };
    }

    public override setupCardAbilities () {
        this.addOnAttackAbility({
            title: 'This unit gets +1/+0 for this attack for each damaged unit the defending player controls',
            immediateEffect: AbilityHelper.immediateEffects.forThisAttackCardEffect((context) => ({
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: context.player.opponent.getArenaUnits({ condition: (unit) => unit.isUnit() && unit.damage > 0 }).length, hp: 0 }),
            }))
        });
    }
}