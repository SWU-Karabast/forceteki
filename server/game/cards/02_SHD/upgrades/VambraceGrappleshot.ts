import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class VambraceGrappleshot extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3525325147',
            internalName: 'vambrace-grappleshot',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle));

        registrar.addGainOnAttackAbilityTargetingAttached({
            title: 'Exhaust the defender on attack',
            immediateEffect: AbilityHelper.immediateEffects.exhaust((context) => {
                return { target: context.source.activeAttack?.getAllTargets() };
            })
        });
    }
}
