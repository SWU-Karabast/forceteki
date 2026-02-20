import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';

export default class TheStrangerNoSurvivors extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'the-stranger#no-survivors-id',
            internalName: 'the-stranger#no-survivors',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        // This is not technically a triggered ability, but the player must make a choice when this unit is attacking
        // so we use a triggered ability to prompt the player to make that choice at the start of the attack
        registrar.addOnAttackAbility({
            title: 'The defending unit can deal damage first for this attack',
            targetResolver: {
                activePromptTitle: 'Choose how damage is dealt for this attack',
                mode: TargetMode.Select,
                condition: (context) =>
                    context.event.attack.targetIsUnit() &&
                    !context.event.attack.attackerDealsCombatDamageFirst(), // Only offer the choice if the attacker isn't already dealing damage first
                choices: (context) => ({
                    ['Defender deals damage first']: AbilityHelper.immediateEffects.forThisAttackCardEffect({
                        target: context.event.attack
                            .getAllTargets()
                            .filter((t) => t.isUnit()),
                        effect: AbilityHelper.ongoingEffects.dealsCombatDamageFirst(),
                        ongoingEffectDescription: 'deal combat damage after'
                    }),
                    ['Deal damage normally']: AbilityHelper.immediateEffects.noAction({ hasLegalTarget: true })
                })
            }
        });
    }
}