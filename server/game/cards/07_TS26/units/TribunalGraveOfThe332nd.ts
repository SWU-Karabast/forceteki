import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { TextHelper } from '../../../core/utils/TextHelper';
import type { Player } from '../../../core/Player';
import type { Card } from '../../../core/card/Card';

export default class TribunalGraveOfThe332nd extends NonLeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: 'tribunal#grave-of-the-332nd-id',
            internalName: 'tribunal#grave-of-the-332nd'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper) {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addDecreaseCostAbility({
            title: `This unit costs ${TextHelper.resource(2)} less to play for each other card you played this phase`,
            amount: (_card, player) => 2 * this.numCardsPlayedByPlayerThisPhase(_card, player)
        });

        registrar.addWhenPlayedAbility({
            title: 'Give each other unit -2/-2 for this phase',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                target: context.game.getArenaUnits({ otherThan: context.source }),
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 }),
            })),
        });
    }

    private numCardsPlayedByPlayerThisPhase(card: Card, player: Player): number {
        return this.cardsPlayedThisPhaseWatcher.getCardsPlayed(
            (entry) => entry.playedBy === player && entry.card !== card
        ).length;
    }
}
