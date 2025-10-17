import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { AttacksThisPhaseWatcher } from '../../../stateWatchers/AttacksThisPhaseWatcher';
import type { CardsEnteredPlayThisPhaseWatcher } from '../../../stateWatchers/CardsEnteredPlayThisPhaseWatcher';

export default class ItsNotOverYet extends EventCard {
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;
    private cardsEnteredPlayThisPhaseWatcher: CardsEnteredPlayThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: 'its-not-over-yet-id',
            internalName: 'its-not-over-yet',
        };
    }

    protected override setupStateWatchers (registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.attacksThisPhaseWatcher = AbilityHelper.stateWatchers.attacksThisPhase(registrar);
        this.cardsEnteredPlayThisPhaseWatcher = AbilityHelper.stateWatchers.cardsEnteredPlayThisPhase(registrar);
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Ready a unit that didn\'t attack or enter play this phase. Create a Spy token',
            immediateEffect: abilityHelper.immediateEffects.simultaneous([
                abilityHelper.immediateEffects.optional({
                    title: 'Ready a unit that didn\'t attack or enter play this phase',
                    innerSystem: abilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        cardCondition: (card) =>
                            !this.attacksThisPhaseWatcher.cardDidAttack(card) &&
                            !this.cardsEnteredPlayThisPhaseWatcher.someCardEnteredPlay((e) => e.card === card),
                        immediateEffect: abilityHelper.immediateEffects.ready()
                    })
                }),
                abilityHelper.immediateEffects.createSpy(),
            ]),
        });
    }
}