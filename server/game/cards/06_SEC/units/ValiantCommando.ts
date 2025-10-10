import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageType } from '../../../core/Constants';

export default class ValiantCommando extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'valiant-commando-id',
            internalName: 'valiant-commando',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Defeat this unit. If you do, deal 3 damage to the damaged base',
            when: {
                onDamageDealt: (event, context) =>
                    // TODO: refactor damage enum types to account for the fact that overwhelm is combat damage
                    event.damageSource?.attack?.attacker === context.source &&
                    ((event.type === DamageType.Combat && event.damageSource.attack.getAllTargets().some((target) => target.isBase())) || event.type === DamageType.Overwhelm)
            },
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.defeat((context) => ({ target: context.source })),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Deal 3 damage to the damaged base',
                immediateEffect: abilityHelper.immediateEffects.damage({
                    amount: 3,
                    target: ifYouDoContext.event.type === DamageType.Overwhelm
                        ? ifYouDoContext.event.card
                        : ifYouDoContext.event.damageSource.attack.getAllTargets().find((target) => target.isBase())
                })
            })
        });
    }
}