import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsLeftPlayThisPhaseWatcher } from '../../../stateWatchers/CardsLeftPlayThisPhaseWatcher';
import { isUnit } from '../../../core/utils/EnumHelpers';

export default class BobaFettCollectingTheBounty extends LeaderUnitCard {
    private cardsLeftPlayThisPhaseWatcher: CardsLeftPlayThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '4626028465',
            internalName: 'boba-fett#collecting-the-bounty',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.cardsLeftPlayThisPhaseWatcher = AbilityHelper.stateWatchers.cardsLeftPlayThisPhase(registrar, this);
    }

    protected override setupLeaderSideAbilities() {
        this.addTriggeredAbility({
            title: 'Exhaust Boba Fett to ready a resource',
            when: {
                onCardLeavesPlay: (event, context) =>
                    isUnit(event.lastKnownInformation.type) && event.lastKnownInformation.controller !== context.player
            },
            // we shortcut and automatically activate Boba's ability if there are any exhausted resources
            immediateEffect: AbilityHelper.immediateEffects.conditional((context) => ({
                condition: context.player.exhaustedResourceCount > 0,
                onTrue: AbilityHelper.immediateEffects.exhaust(),
            })),
            ifYouDo: {
                title: 'Ready a resource',
                ifYouDoCondition: (context) => context.player.resources.some((resource) => resource.exhausted),
                immediateEffect: AbilityHelper.immediateEffects.readyResources({ amount: 1 }),
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addTriggeredAbility({
            title: 'Ready 2 resources',
            when: {
                onAttackCompleted: (event, context) => event.attack.attacker === context.source,
            },
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => {
                    const opponentHasUnitsThatLeftPlayThisPhase = this.cardsLeftPlayThisPhaseWatcher.someUnitLeftPlay({ controller: context.player.opponent });
                    const playerHasResourcesToReady = context.player.resources.some((resource) => resource.exhausted);
                    return opponentHasUnitsThatLeftPlayThisPhase && playerHasResourcesToReady;
                },
                onTrue: AbilityHelper.immediateEffects.readyResources({ amount: 2 }),
            })
        });
    }
}
