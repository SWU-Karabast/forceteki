import type { IAbilityHelper } from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait, WildcardZoneName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { EnumHelpers } from '../../../core/utils/EnumHelpers';
import type { DamageDealtThisPhaseWatcher } from '../../../stateWatchers/DamageDealtThisPhaseWatcher';

export default class WhistlingBirds extends UpgradeCard {
    private damageDealtThisPhaseWatcher: DamageDealtThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '6813624612',
            internalName: 'whistling-birds',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.damageDealtThisPhaseWatcher = AbilityHelper.stateWatchers.damageDealtThisPhase();
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addGainWhenAttackEndsAbilityTargetingAttached({
            title: 'Deal 2 damage to each unit that opponent controls in this unit\'s arena',
            contextTitle: (context) => this.makeAbilityTitle(context),
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) =>
                    this.damageDealtThisPhaseWatcher.unitHasDealtCombatDamageToBaseThisAttack(context.source, context),
                onTrue: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: 2,
                    target: context.player.opponent.getArenaUnits({
                        // Use the attacker's LKI so we still resolve to the correct arena when
                        // the attacker has been defeated by combat damage in this same attack.
                        arena: context.event.attackerLastKnownInformation.arena
                    })
                }))
            })
        });
    }

    private makeAbilityTitle(context: TriggeredAbilityContext): string {
        const arena = context.event.attackerLastKnownInformation.arena;

        if (!EnumHelpers.isArena(arena) && arena !== WildcardZoneName.AnyArena) {
            return 'Deal 2 damage to each unit that opponent controls in this unit\'s arena';
        }

        return `Deal 2 damage to each unit that opponent controls in the ${EnumHelpers.arenaName(arena)}`;
    }
}
