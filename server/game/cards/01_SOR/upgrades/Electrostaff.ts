import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { RelativePlayer, Trait } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';

export default class Electrostaff extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '1323728003',
            internalName: 'electrostaff',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle));

        card.addConstantAbility({
            title: 'While attached unit is defending, the attacker gets -1/-0',
            targetController: RelativePlayer.Opponent,
            matchTarget: (card, context) => card.isUnit() && card.isInPlay() && card.isAttacking() && card.activeAttack.getAllTargets().includes(context.source.parentCard),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: -1, hp: 0 })
        });
    }
}
