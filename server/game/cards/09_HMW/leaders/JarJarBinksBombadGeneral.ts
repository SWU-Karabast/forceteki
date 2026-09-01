import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType, WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { TokensCreatedThisPhaseWatcher } from '../../../stateWatchers/TokensCreatedThisPhaseWatcher';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { GameSystem } from '../../../core/gameSystem/GameSystem';

export default class JarJarBinksBombadGeneral extends LeaderUnitCard {
    private tokensCreatedThisPhaseWatcher: TokensCreatedThisPhaseWatcher;

    protected override getImplementationId () {
        return {
            id: 'jar-jar-binks#bombad-general-id',
            internalName: 'jar-jar-binks#bombad-general',
        };
    }

    protected override setupStateWatchers (registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.tokensCreatedThisPhaseWatcher = AbilityHelper.stateWatchers.tokensCreatedThisPhase();
    }

    protected override setupLeaderSideAbilities (registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Deal 1 damage to a unit and heal 1 damage from a base',
            cost: [abilityHelper.costs.abilityActivationResourceCost(1), abilityHelper.costs.exhaustSelf()],
            immediateEffect: this.jarJarAbility(abilityHelper)
        });
    }

    protected override setupLeaderUnitSideAbilities (registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Deal 1 damage to a unit and heal 1 damage from a base',
            optional: true,
            immediateEffect: this.jarJarAbility(abilityHelper)
        });
    }

    private jarJarAbility<TContext extends AbilityContext<LeaderUnitCard>>(abilityHelper: IAbilityHelper): GameSystem<TContext> {
        return abilityHelper.immediateEffects.conditional({
            condition: (context) =>
                this.tokensCreatedThisPhaseWatcher.someTokenCreated((entry) =>
                    entry.createdBy === context.player &&
                    entry.token.isTokenUpgrade() &&
                    entry.token.parentCard.isUnit()
                ),
            onTrue: abilityHelper.immediateEffects.sequential([
                abilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Deal 1 damage to a unit',
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
                }),
                abilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Heal 1 damage from a base',
                    cardTypeFilter: CardType.Base,
                    immediateEffect: abilityHelper.immediateEffects.heal({ amount: 1 })
                })
            ])
        });
    }
}