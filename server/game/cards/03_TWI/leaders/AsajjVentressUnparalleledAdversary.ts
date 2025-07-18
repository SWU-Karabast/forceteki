import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';
import { Duration } from '../../../core/Constants';
import type { Player } from '../../../core/Player';

export default class AsajjVentressUnparalleledAdversary extends LeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '8929774056',
            internalName: 'asajj-ventress#unparalleled-adversary',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Attack with a unit. If you played an event this phase, it gets +1/+0 for this attack',
            cost: AbilityHelper.costs.exhaustSelf(),
            initiateAttack: {
                attackerLastingEffects: {
                    condition: (context) => this.hasPlayedAnEventThisPhase(context.attacker.controller),
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'If you played an event this phase, this unit gets +1/+0 for this attack and deals combat damage before the defender',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.hasPlayedAnEventThisPhase(context.player),
                onTrue: AbilityHelper.immediateEffects.cardLastingEffect({
                    duration: Duration.UntilEndOfAttack,
                    effect: [AbilityHelper.ongoingEffects.dealsDamageBeforeDefender(),
                        AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })]
                }),
            })
        });
    }

    private hasPlayedAnEventThisPhase(controller: Player) {
        return this.cardsPlayedThisPhaseWatcher.someCardPlayed((entry) => entry.playedBy === controller && entry.card.isEvent());
    }
}
