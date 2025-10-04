import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { GameStateChangeRequired, RelativePlayer, ZoneName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class BailOrganaDoingEverythingHeCan extends LeaderUnitCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '3016542990',
            internalName: 'bail-organa#doing-everything-he-can',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase(registrar, this);
    }

    protected override deployActionAbilityProps(AbilityHelper: IAbilityHelper) {
        return {
            limit: AbilityHelper.limit.unlimited(),
            cost: (context) => [
                AbilityHelper.costs.exhaustSelf<AbilityContext<this>>(),
                AbilityHelper.costs.discardCardsFromOwnHand<AbilityContext<this>>(2, context.player),
            ],
            condition: (context) => context.player.resources.length >= context.source.cost
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'If a friendly unit was defeated this phase, return a friendly resource to its owner\'s hand. If you do, put the top card of your deck into play as a resource.',
            cost: [abilityHelper.costs.abilityActivationResourceCost(1), abilityHelper.costs.exhaustSelf()],
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => this.unitsDefeatedThisPhaseWatcher.someDefeatedUnitControlledByPlayer(context.player),
                onTrue: abilityHelper.immediateEffects.selectCard({
                    controller: RelativePlayer.Self,
                    zoneFilter: ZoneName.Resource,
                    mustChangeGameState: GameStateChangeRequired.MustFullyResolve, // TODO - is this needed?
                    immediateEffect: abilityHelper.immediateEffects.returnToHand()
                })
            }),
            ifYouDo: {
                title: 'Put the top card of your deck into play as a resource',
                immediateEffect: abilityHelper.immediateEffects.resourceCard((context) => ({
                    target: context.player.getTopCardOfDeck()
                }))
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'When you play a card from your resources, heal 1 damage from your base',
            when: { onCardPlayed: (event, context) => event.originalZone === ZoneName.Resource && event.player === context.player },
            immediateEffect: abilityHelper.immediateEffects.heal((context) => ({
                target: context.player.base,
                amount: 1
            }))
        });
    }
}
