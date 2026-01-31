import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsDrawnThisPhaseWatcher } from '../../../stateWatchers/CardsDrawnThisPhaseWatcher';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class BeilertValanceTargetVader extends NonLeaderUnitCard {
    private cardsDrawnThisPhaseWatcher: CardsDrawnThisPhaseWatcher;

    protected override getImplementationId () {
        return {
            id: '3803673331',
            internalName: 'beilert-valance#target-vader',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsDrawnThisPhaseWatcher = AbilityHelper.stateWatchers.cardsDrawnThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Draw a card. You may deal damage to a ground unit equal to the number of cards you\'ve drawn this phase',
            immediateEffect: AbilityHelper.immediateEffects.draw((context) => ({ target: context.player })),
            then: (thenContext) => ({
                title: `Deal ${this.cardsDrawnThisPhaseWatcher.drawnCardsAmount(thenContext.player)} damage to a ground unit`,
                optional: true,
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: ZoneName.GroundArena,
                    immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                        amount: this.cardsDrawnThisPhaseWatcher.drawnCardsAmount(context.player)
                    }))
                }
            }),
        });
    }
}