import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
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
        // A unit that gains this ability (e.g. Darth Maul via Improvised Identity) may be attacking
        // more than one defender, so always work from the full target list rather than a single target.
        const eligibleDefenders = (context: TriggeredAbilityContext) =>
            context.event.attack.getAllTargets().filter((target) =>
                target.isUnit() && !target.hasSomeTrait(Trait.Droid) && !target.hasSomeTrait(Trait.Vehicle)
            );

        registrar.addOnAttackAbility({
            title: `Pay ${TextHelper.resource(2)} to give 2 Weakness tokens to defending non-${TextHelper.Trait.Droid} non-${TextHelper.Trait.Vehicle} units`,
            optional: true,
            // Wrapping the payment in a conditional means there is no prompt at all when no defender
            // qualifies (attacking a base, a Droid, or a Vehicle), rather than a pointless one.
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => eligibleDefenders(context).length > 0,
                onTrue: abilityHelper.immediateEffects.payResources((context) => ({
                    target: context.player,
                    amount: 2
                }))
            }),
            ifYouDo: {
                title: 'Give 2 Weakness tokens to each eligible defending unit',
                immediateEffect: abilityHelper.immediateEffects.giveWeakness((context) => ({
                    target: eligibleDefenders(context),
                    amount: 2
                }))
            }
        });
    }
}
