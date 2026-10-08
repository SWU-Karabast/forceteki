import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsLeftPlayThisPhaseWatcher } from '../../../stateWatchers/CardsLeftPlayThisPhaseWatcher';
import { EnumHelpers } from '../../../core/utils/EnumHelpers';
import { TargetMode } from '../../../core/Constants';

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
                ifYouDoCondition: (context) => context.game.getPlayers().some((player) => player.exhaustedResourceCount > 0),
                targetResolver: {
                    activePromptTitle: 'Choose a player to ready a resource',
                    mode: TargetMode.Player,
                    immediateEffect: AbilityHelper.immediateEffects.readyResources({ amount: 1 })
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenAttackEndsAbility({
            title: 'Ready up to 2 resources',
            attackerMustSurvive: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.cardsLeftPlayThisPhaseWatcher.someUnitLeftPlay({ controller: context.player.opponent }),
                onTrue: AbilityHelper.immediateEffects.selectPlayer({
                    activePromptTitle: 'Choose a player to ready resources',
                    immediateEffect: AbilityHelper.immediateEffects.chooseNumber({
                        activePromptTitle: 'Choose how many resources to ready',
                        min: 0,
                        max: 2,
                        immediateEffect: AbilityHelper.immediateEffects.readyResources((context) => ({
                            amount: Number(context.select)
                        }))
                    })
                })
            })
        });
    }
}
