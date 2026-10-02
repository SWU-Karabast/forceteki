import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IWhenAttackEndsAbilityProps } from '../../../Interfaces';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsLeftPlayThisPhaseWatcher } from '../../../stateWatchers/CardsLeftPlayThisPhaseWatcher';
import { EnumHelpers } from '../../../core/utils/EnumHelpers';
import { EventName, TargetMode } from '../../../core/Constants';

export default class BobaFettCollectingTheBounty extends LeaderUnitCard {
    private cardsLeftPlayThisPhaseWatcher: CardsLeftPlayThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '4626028465',
            internalName: 'boba-fett#collecting-the-bounty',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsLeftPlayThisPhaseWatcher = AbilityHelper.stateWatchers.cardsLeftPlayThisPhase();
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Exhaust Boba Fett to ready a resource',
            when: {
                onCardLeavesPlay: (event, context) =>
                    EnumHelpers.isUnit(event.lastKnownInformation.type) && event.lastKnownInformation.controller !== context.player
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            ifYouDo: {
                title: 'Ready a resource',
                ifYouDoCondition: (context) => context.player.resources.some((resource) => resource.exhausted),
                targetResolver: {
                    activePromptTitle: 'Choose a player to ready a resource',
                    mode: TargetMode.Player,
                    immediateEffect: AbilityHelper.immediateEffects.readyResources({ amount: 1 })
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        const ability: IWhenAttackEndsAbilityProps<this> = {
            title: 'Ready up to 2 resources',
            attackerMustSurvive: true,
            optional: true,
            when: {
                [EventName.OnAttackEnd]: (event, context) => {
                    const isBobaAttack = event.attack.attacker === context.source;
                    const opponentHadAUnitLeavePlay = this.cardsLeftPlayThisPhaseWatcher.someUnitLeftPlay({ controller: context.player.opponent });
                    const playerHasResourcesToReady = context.player.resources.some((resource) => resource.exhausted);
                    const attackDamage = event.attack.getAttackerCombatDamage(context);
                    const attackWillDefeatEnemyUnit = attackDamage !== null && event.attack.getAllTargets().some((target) =>
                        target.isUnit() &&
                        target.controller === context.player.opponent &&
                        target.isInPlay() &&
                        !target.hasShield() &&
                        attackDamage >= target.remainingHp
                    );

                    return isBobaAttack && (opponentHadAUnitLeavePlay || attackWillDefeatEnemyUnit) && playerHasResourcesToReady;
                },
            },
            targetResolvers: {
                player: {
                    activePromptTitle: 'Choose a player to ready resources',
                    mode: TargetMode.Player,
                },
                target: {
                    activePromptTitle: 'Choose how many resources to ready',
                    mode: TargetMode.ChooseNumber,
                    min: 0,
                    max: (context) => Math.min(2, context.targets.player?.exhaustedResourceCount ?? 0),
                    immediateEffect: AbilityHelper.immediateEffects.conditional({
                        condition: (context) => Number(context.select) > 0,
                        onTrue: AbilityHelper.immediateEffects.readyResources((context) => ({
                            amount: Number(context.select),
                            target: context.targets.player,
                        })),
                        onFalse: AbilityHelper.immediateEffects.noAction({ hasLegalTarget: true }),
                    }),
                }
            }
        };

        registrar.addTriggeredAbility(ability);
    }
}
