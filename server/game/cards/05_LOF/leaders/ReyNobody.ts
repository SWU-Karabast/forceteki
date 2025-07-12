import AbilityHelper from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Trait, WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';

export default class ReyNobody extends LeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '2762251208',
            internalName: 'rey#nobody',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar) {
        registrar.addActionAbility({
            title: 'Deal 1 damage to a unit',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => this.nonUnitForceCardPlayedThisPhase(context),
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 1 }),
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'Discard your hand',
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.discardEntireHand((context) => ({ target: context.player })),
            ifYouDo: {
                title: 'Draw 2 cards',
                immediateEffect: AbilityHelper.immediateEffects.draw({ amount: 2 })
            }
        });
    }

    private nonUnitForceCardPlayedThisPhase(context): boolean {
        return this.cardsPlayedThisPhaseWatcher.someCardPlayed((playedCardEntry) =>
            playedCardEntry.playedBy === context.player &&
            playedCardEntry.card.hasSomeTrait(Trait.Force) &&
            !playedCardEntry.card.isUnit()
        );
    }
}
