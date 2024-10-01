import AbilityHelper from '../../../AbilityHelper';
import { Attack } from '../../../core/attack/Attack';
import { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';
import Player from '../../../core/Player';

export default class JediLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '8495694166',
            internalName: 'jedi-lightsaber',
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
            title: 'Give the defender -2/-2 for this phase',
            gainCondition: (context) => context.source.parentCard?.hasSomeTrait(Trait.Force),

            // need to check if the target is a base - if so, don't apply the stat modifier effect
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.event.attack.target.isBase(),
                onTrue: AbilityHelper.immediateEffects.noAction(),
                onFalse: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 }),
                    target: (context.event.attack as Attack).target
                }))
            })
        });
    }
}

JediLightsaber.implemented = true;
