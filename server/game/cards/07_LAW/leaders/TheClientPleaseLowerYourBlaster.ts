import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';
import type { TokensCreatedThisPhaseWatcher } from '../../../stateWatchers/TokensCreatedThisPhaseWatcher';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';

export default class TheClientPleaseLowerYourBlaster extends LeaderUnitCard {
    private tokensCreatedThisPhaseWatcher: TokensCreatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '8200426759',
            internalName: 'the-client#please-lower-your-blaster',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.tokensCreatedThisPhaseWatcher = AbilityHelper.stateWatchers.tokensCreatedThisPhase();
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'If you created a token this phase, exhaust an enemy unit',
            cost: [abilityHelper.costs.exhaustSelf()],
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => this.tokensCreatedThisPhaseWatcher.someTokenCreated((entry) => entry.createdBy === context.player),
                onTrue: abilityHelper.immediateEffects.selectCard({
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: abilityHelper.immediateEffects.exhaust()
                })
            }),
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Exhaust an enemy unit',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => this.tokensCreatedThisPhaseWatcher.someTokenCreated((entry) => entry.createdBy === context.player),
                onTrue: abilityHelper.immediateEffects.selectCard({
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: abilityHelper.immediateEffects.exhaust()
                })
            }),
        });
    }
}