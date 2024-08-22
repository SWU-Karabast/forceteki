import AbilityHelper from '../../AbilityHelper';
import { Card } from '../../core/card/Card';
import { UpgradeCard } from '../../core/card/UpgradeCard';
import { AbilityType, Trait } from '../../core/Constants';
import Player from '../../core/Player';
import { ITriggeredAbilityProps } from '../../Interfaces';

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
        const abilityProps: ITriggeredAbilityProps = {
            title: 'Exhaust the defender on attack',
            when: { onAttackDeclared: (event) => event.attack.attacker === this },
            targetResolver: {
                cardCondition: (card, context) => card === context.event.attack.attacker,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        };

        this.addConstantAbilityTargetingAttached({
            title: 'Give ability to the attached card',
            ongoingEffect: AbilityHelper.ongoingEffects.gainAbility(AbilityType.Triggered, abilityProps)
        });
    }
}

VambraceGrappleshot.implemented = true;