import type { IAbilityHelper } from '../../../AbilityHelper';
import { DamageType, Trait } from '../../../core/Constants';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class DorsalTurret extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '9338356823',
            internalName: 'dorsal-turret'
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => context.target.hasSomeTrait(Trait.Vehicle));

        registrar.addGainTriggeredAbilityTargetingAttached({
            title: 'Defeat that unit.',
            when: {
                onDamageDealt: (event, context) =>
                    event.type === DamageType.Combat &&
                    event.damageSource.attack.attacker === context.source &&
                    event.damageSource.damageDealtBy.includes(context.source) &&
                    event.damageSource.attack.targetIsUnit()
            },
            immediateEffect: AbilityHelper.immediateEffects.defeat((context) => ({ target: context.event.card }))
        });
    }
}
