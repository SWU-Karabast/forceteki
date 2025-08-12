import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { ForceUsedThisPhaseWatcher } from '../../../stateWatchers/ForceUsedThisPhaseWatcher';

export default class AvarKrissMarshalOfStarlight extends LeaderUnitCard {
    private forceUsedThisPhaseWatcher: ForceUsedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '0092239541',
            internalName: 'avar-kriss#marshal-of-starlight',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper) {
        this.forceUsedThisPhaseWatcher = AbilityHelper.stateWatchers.forceUsedThisPhase(registrar, this);
    }

    protected override deployActionAbilityProps() {
        return {
            condition: (context) =>
                context.player.resources.length + this.forceUsedThisPhaseWatcher.countForceUsedThisPhase(context.player) >= context.source.cost
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'The Force is with you',
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.theForceIsWithYou()
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While the Force is with you, this units gets +4/+0 and gains Overwhelm',
            condition: (context) => context.player.hasTheForce,
            ongoingEffect: [
                AbilityHelper.ongoingEffects.modifyStats({ power: 4, hp: 0 }),
                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm)
            ]
        });
    }
}
