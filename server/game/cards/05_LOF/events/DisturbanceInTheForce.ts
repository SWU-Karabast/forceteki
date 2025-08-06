import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsLeftPlayThisPhaseWatcher } from '../../../stateWatchers/CardsLeftPlayThisPhaseWatcher';

export default class DisturbanceInTheForce extends EventCard {
    private cardsLeftPlayThisPhaseWatcher: CardsLeftPlayThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '2720873461',
            internalName: 'disturbance-in-the-force',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsLeftPlayThisPhaseWatcher = AbilityHelper.stateWatchers.cardsLeftPlayThisPhase(registrar, this);
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'If a friendly unit left play this phase, the Force is with you and you may give a Shield token to a unit',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.cardsLeftPlayThisPhaseWatcher.someUnitLeftPlay({ controller: context.player }),
                onTrue: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.theForceIsWithYou(),
                    AbilityHelper.immediateEffects.selectCard({
                        optional: true,
                        cardTypeFilter: WildcardCardType.Unit,
                        immediateEffect: AbilityHelper.immediateEffects.giveShield()
                    })
                ])
            })
        });
    }
}
