import AbilityHelper from '../../../AbilityHelper';
import { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';
import Player from '../../../core/Player';

export default class VambraceGrappleshot extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3525325147',
            internalName: 'vambrace-grappleshot',
        };
    }

    public override canAttach(targetCard: Card, controller: Player = this.controller): boolean {
        if (targetCard.hasSomeTrait(Trait.Vehicle)) {
            return false;
        }

        return super.canAttach(targetCard, controller);
    }

    public override setupCardAbilities() {
        this.addGainOnAttackAbilityTargetingAttached({
            title: 'Exhaust the defender on attack',
            immediateEffect: AbilityHelper.immediateEffects.exhaust((context) => {
                return { target: context.source.activeAttack?.target };
            })
        });
    }
}

VambraceGrappleshot.implemented = true;
