import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';

export default class UndercoverOperation extends EventCard {
    private cardsPlayedThisPhase: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '0889609495',
            internalName: 'undercover-operation',
        };
    }

    protected override setupStateWatchers (registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsPlayedThisPhase = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Ready a unit that was played this phase. If it costs 3 or less, create a Spy token',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => this.cardsPlayedThisPhase.someCardPlayed((entry) =>
                    entry.card === card && card.canBeInPlay() && entry.inPlayId === card.inPlayId),
                immediateEffect: abilityHelper.immediateEffects.simultaneous([
                    abilityHelper.immediateEffects.ready(),
                    abilityHelper.immediateEffects.conditional({
                        condition: (context) => context.target.isUnit() && context.target.cost <= 3,
                        onTrue: abilityHelper.immediateEffects.createSpy((context) => ({ amount: 1, target: context.player }))
                    })
                ])
            }
        });
    }
}