import AbilityHelper from '../../AbilityHelper';
import { Card } from '../../core/card/Card';
import { UpgradeCard } from '../../core/card/UpgradeCard';
import { Trait } from '../../core/Constants';
import Player from '../../core/Player';

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
        this.addGainTriggeredAbilityTargetingAttached({
            title: 'Exhaust the defender on attack',
            when: { onAttackDeclared: (event, context) => event.attack.attacker === context.source },
            targetResolver: {
                cardCondition: (card, context) => card === context.event.attack.target,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });
    }
}

VambraceGrappleshot.implemented = true;