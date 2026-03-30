import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { AbilityType, DamageModificationType } from '../../../core/Constants';
import { DamageSourceType } from '../../../IDamageOrDefeatSource';

export default class Brothers extends EventCard {
    protected override getImplementationId () {
        return {
            id: '7421920224',
            internalName: 'brothers',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with a unique unit. Prevent all combat damage that would be dealt to it for this attack',
            optional: true,
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.attack({
                    attackerCondition: (card) => card.unique,
                    attackerLastingEffects: {
                        effect: AbilityHelper.ongoingEffects.gainDamageModificationAbility({
                            title: 'Prevent all combat damage that would be dealt to this unit',
                            type: AbilityType.DamageModification,
                            modificationType: DamageModificationType.PreventAll,
                            damageOfType: DamageSourceType.Attack
                        }),
                    }
                })
            },
            then: (thenContext) => ({
                title: 'Attack with another unique unit. Prevent all combat damage that would be dealt to it for this attack',
                optional: true,
                initiateAttack: {
                    attackerCondition: (card) => card.unique && thenContext.target !== card,
                    attackerLastingEffects: {
                        effect: AbilityHelper.ongoingEffects.gainDamageModificationAbility({
                            title: 'Prevent all combat damage that would be dealt to this unit',
                            type: AbilityType.DamageModification,
                            modificationType: DamageModificationType.PreventAll,
                            damageOfType: DamageSourceType.Attack
                        }),
                    }
                }
            })
        });
    }
}