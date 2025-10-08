import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { RelativePlayer, Trait } from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class Electrostaff extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '1323728003',
            internalName: 'electrostaff',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.target.hasSomeTrait(Trait.Vehicle));

        registrar.addConstantAbility({
            title: 'While attached unit is defending, the attacker gets -1/-0',
            targetController: RelativePlayer.Opponent,
            matchTarget: (card, context) => card.isUnit() && card.isInPlay() && card.isAttacking() && card.activeAttack.getAllTargets().includes(context.source.parentCard),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: -1, hp: 0 })
        });
    }
}
