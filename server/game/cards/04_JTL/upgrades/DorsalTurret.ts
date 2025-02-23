import AbilityHelper from '../../../AbilityHelper';
import { DamageType, Trait } from '../../../core/Constants';
import type { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class DorsalTurret extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '9338356823',
            internalName: 'dorsal-turret'
        };
    }

    public override setupCardAbilities() {
        this.setAttachCondition((card: Card) => card.hasSomeTrait(Trait.Vehicle));

        this.addGainTriggeredAbilityTargetingAttached({
            title: 'When this unit deals combat damage to a unit while attacking: Defeat that unit.',
            when: {
                onDamageDealt: (event, context) =>
                    event.type === DamageType.Combat &&
                    event.damageSource.attack.attacker === context.source &&
                    event.damageSource.damageDealtBy === context.source &&
                    event.damageSource.attack.target?.isUnit()
            },
            immediateEffect: AbilityHelper.immediateEffects.defeat((context) => ({ target: context.event.damageSource.attack.target }))
        });
    }
}
