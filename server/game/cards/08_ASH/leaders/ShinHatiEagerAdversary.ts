import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { DamageDealtThisPhaseWatcher } from '../../../stateWatchers/DamageDealtThisPhaseWatcher';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';

export default class ShinHatiEagerAdversary extends LeaderUnitCard {
    private damageDealtThisPhaseWatcher: DamageDealtThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '7358789406',
            internalName: 'shin-hati#eager-adversary',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, abilityHelper: IAbilityHelper): void {
        this.damageDealtThisPhaseWatcher = abilityHelper.stateWatchers.damageDealtThisPhase();
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Exhaust a unit that costs less than the amount of combat damage dealt to a base this attack',
            contextTitle: (context) => this.getContextTitle(context),
            when: {
                onAttackEnd: (event, context) =>
                    event.attack.attackingPlayer === context.player &&
                    this.damageDealtThisPhaseWatcher.unitHasDealtCombatDamageToBaseThisAttack(event.attack.attacker, context)
            },
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.exhaust(),
            ifYouDo: {
                title: 'Exhaust a unit that costs less than the amount of combat damage dealt to a base this attack',
                targetResolver: {
                    activePromptTitle: (context) => this.getContextTitle(context),
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card, context) => {
                        const damageAmount = this.damageDealtThisPhaseWatcher.getDamageDealtToBaseByUnitThisAttack(context.event.attack.attacker, context);
                        return card.isUnit() && card.cost < damageAmount;
                    },
                    immediateEffect: abilityHelper.immediateEffects.exhaust()
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Exhaust a unit that costs less than the amount of combat damage dealt to a base this attack',
            contextTitle: (context) => this.getContextTitle(context),
            when: {
                onAttackEnd: (event, context) =>
                    event.attack.attackingPlayer === context.player &&
                    this.damageDealtThisPhaseWatcher.unitHasDealtCombatDamageToBaseThisAttack(event.attack.attacker, context)
            },
            optional: true,
            limit: abilityHelper.limit.perRound(1),
            targetResolver: {
                activePromptTitle: (context) => this.getContextTitle(context),
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => {
                    const damageAmount = this.damageDealtThisPhaseWatcher.getDamageDealtToBaseByUnitThisAttack(context.event.attack.attacker, context);
                    return card.isUnit() && card.cost < damageAmount;
                },
                immediateEffect: abilityHelper.immediateEffects.exhaust()
            }
        });
    }

    private getContextTitle(context: TriggeredAbilityContext): string {
        const damageAmount = this.damageDealtThisPhaseWatcher.getDamageDealtToBaseByUnitThisAttack(context.event.attack.attacker, context);
        return `Exhaust a unit that costs less than ${damageAmount}`;
    }
}
