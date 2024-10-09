import AbilityHelper from '../../../AbilityHelper';
import { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class VambraceGrappleshot extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3525325147',
            internalName: 'vambrace-grappleshot',
        };
    }

    public override setupCardAbilities() {
        this.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle));

        this.addGainOnAttackAbilityTargetingAttached({
            title: 'Exhaust the defender on attack',
            immediateEffect: AbilityHelper.immediateEffects.exhaust((context) => {
                return { target: context.source.activeAttack?.target };
            })
        });
    }
}

VambraceGrappleshot.implemented = true;
