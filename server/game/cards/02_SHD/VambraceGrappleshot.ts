import AbilityHelper from '../../AbilityHelper';
import { TriggeredAbilityContext } from '../../core/ability/TriggeredAbilityContext';
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
            immediateEffect: AbilityHelper.immediateEffects.exhaust((context) => {
                return { target: (context as TriggeredAbilityContext)?.event.attack.target };
            })
        });
    }
}

VambraceGrappleshot.implemented = true;