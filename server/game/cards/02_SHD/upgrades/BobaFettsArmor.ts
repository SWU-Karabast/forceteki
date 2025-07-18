import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { DamageType, Trait } from '../../../core/Constants';
import type { Card } from '../../../core/card/Card';
import { DamageSystem } from '../../../gameSystems/DamageSystem';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class BobaFettsArmor extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '5738033724',
            internalName: 'boba-fetts-armor'
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle));

        registrar.addReplacementEffectAbility({
            title: 'If attached unit is Boba Fett and damage would be dealt to him, prevent 2 of that damage',
            when: {
                onDamageDealt: (event, context) => event.card === context.source.parentCard &&
                  context.source.parentCard.title === 'Boba Fett' &&
                  !event.isIndirect,
            },
            replaceWith: {
                replacementImmediateEffect: new DamageSystem((context) => ({
                    target: context.source.parentCard,
                    amount: Math.max(context.event.amount - 2, 0),
                    source: context.event.damageSource.type === DamageType.Ability ? context.event.damageSource.card : context.event.damageSource.damageDealtBy,
                    type: context.event.type,
                    sourceAttack: context.event.damageSource.attack,
                }))
            },
            effect: 'prevent 2 damage to {1}',
            effectArgs: (context) => [context.source.parentCard]
        });
    }
}