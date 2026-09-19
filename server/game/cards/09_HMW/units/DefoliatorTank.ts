import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class DefoliatorTank extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0506599569',
            internalName: 'defoliator-tank',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: `If the defending unit isn't a ${TextHelper.Trait.Droid} or ${TextHelper.Trait.Vehicle}, pay ${TextHelper.resource(2)} to give 2 Weakness tokens to it`,
            optional: true,
            // Wrapping the payment in a conditional means there is no prompt at all when the
            // condition fails (attacking a base, a Droid, or a Vehicle), rather than a pointless one.
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.event.attack.targetIsUnit(
                    (unit) => !unit.hasSomeTrait(Trait.Droid) && !unit.hasSomeTrait(Trait.Vehicle)
                ),
                onTrue: abilityHelper.immediateEffects.payResources((context) => ({
                    target: context.player,
                    amount: 2
                }))
            }),
            ifYouDo: {
                title: 'Give 2 Weakness tokens to the defending unit',
                immediateEffect: abilityHelper.immediateEffects.giveWeakness((context) => ({
                    target: context.event.attack.getSingleTarget(),
                    amount: 2
                }))
            }
        });
    }
}
