import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsLeftPlayThisPhaseWatcher } from '../../../stateWatchers/CardsLeftPlayThisPhaseWatcher';

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
            title: 'Exhaust Boba Fett',
            when: {
                onCardLeavesPlay: (event, context) =>
                    event.card.isUnit() && event.card.controller !== context.source.controller
            },
            // we shortcut and automatically activate Boba's ability if there are any exhausted resources
            immediateEffect: AbilityHelper.immediateEffects.conditional((context) => ({
                condition: context.source.controller.exhaustedResourceCount > 0,
                onTrue: AbilityHelper.immediateEffects.exhaust(),
                onFalse: AbilityHelper.immediateEffects.noAction()
            })),
            ifYouDo: {
                title: 'Ready a resource',
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) =>
                        context.source.controller.resources.some((resource) => resource.exhausted),
                    onTrue: AbilityHelper.immediateEffects.readyResources({ amount: 1 }),
                    onFalse: AbilityHelper.immediateEffects.noAction(),
                })
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
                    const opponentHasUnitsThatLeftPlayThisPhase = this.cardsLeftPlayThisPhaseWatcher.someCardLeftPlay({ controller: context.source.controller.opponent, filter: (entry) => entry.card.isUnit() });
                    const playerHasResourcesToReady = context.source.controller.resources.some((resource) => resource.exhausted);
                    return opponentHasUnitsThatLeftPlayThisPhase && playerHasResourcesToReady;
                },
                onTrue: AbilityHelper.immediateEffects.readyResources({ amount: 2 }),
                onFalse: AbilityHelper.immediateEffects.noAction(),

            })
        });
    }
}

BobaFettCollectingTheBounty.implemented = true;
