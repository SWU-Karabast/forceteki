import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class VelSarthaAldhaniInsurgent extends LeaderUnitCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: 'vel-sartha#aldhani-insurgent-id',
            internalName: 'vel-sartha#aldhani-insurgent',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase();
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Give an experience token to a unit, an opponent creates a Credit token',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            },
            then: {
                title: 'An opponent creates a Credit token',
                immediateEffect: AbilityHelper.immediateEffects.createCreditToken((context) => ({
                    target: context.player.opponent
                }))
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Give an experience token to a unit, an opponent creates a Credit token',
            optional: true,
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            },
            ifYouDo: {
                title: 'An opponent creates a Credit token',
                immediateEffect: AbilityHelper.immediateEffects.createCreditToken((context) => ({
                    target: context.player.opponent
                }))
            }
        });
    }
}