import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { RelativePlayer } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';

export default class Electrostaff extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '1323728003',
            internalName: 'electrostaff',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While attached unit is defending, the attacker gets -1/-0',
            targetController: RelativePlayer.Opponent,
            matchTarget: (card, context) => card.isUnit() && card.isInPlay() && card.isAttacking() && card.activeAttack.target === context.source.parentCard,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: -1, hp: 0 })
        });
    }
}
