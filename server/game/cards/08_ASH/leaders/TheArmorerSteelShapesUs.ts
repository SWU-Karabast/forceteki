import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsEnteredPlayThisPhaseWatcher } from '../../../stateWatchers/CardsEnteredPlayThisPhaseWatcher';

export default class TheArmorerSteelShapesUs extends LeaderUnitCard {
    private unitsEnteredPlayThisPhaseWatcher: CardsEnteredPlayThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '5191367506',
            internalName: 'the-armorer#steel-shapes-us',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.unitsEnteredPlayThisPhaseWatcher = AbilityHelper.stateWatchers.cardsEnteredPlayThisPhase();
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Play an upgrade from your resources on a unit that entered play this phase',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                zoneFilter: ZoneName.Resource,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                    playAsType: WildcardCardType.Upgrade,
                    canPlayFromAnyZone: true,
                    attachTargetCondition: (attachTarget) => this.unitsEnteredPlayThisPhaseWatcher.getCardsEnteredPlay((entry) => entry.card === attachTarget).length > 0
                })
            },
            ifYouDo: {
                title: 'Resource the top card of your deck',
                immediateEffect: AbilityHelper.immediateEffects.resourceCard((context) => ({
                    target: context.player.getTopCardOfDeck()
                }))
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenAttackEndsAbility({
            title: 'Play an upgrade from your resources on a friendly unit',
            optional: true,
            targetResolver: {

                zoneFilter: ZoneName.Resource,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                    playAsType: WildcardCardType.Upgrade,
                    canPlayFromAnyZone: true,
                    attachTargetCondition: (attachTarget, context) =>
                        attachTarget.controller === context.player
                })
            },
            ifYouDo: {
                title: 'Resource the top card of your deck',
                immediateEffect: AbilityHelper.immediateEffects.resourceCard((context) => ({
                    target: context.player.getTopCardOfDeck()
                }))
            }
        });
    }
}
