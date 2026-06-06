import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';
import type { CardsLeftPlayThisPhaseWatcher } from '../../../stateWatchers/CardsLeftPlayThisPhaseWatcher';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';

export default class FatefulGoodbye extends EventCard {
    private cardsLeftPlayThisPhaseWatcher: CardsLeftPlayThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '5173793776',
            internalName: 'fateful-goodbye',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsLeftPlayThisPhaseWatcher = AbilityHelper.stateWatchers.cardsLeftPlayThisPhase();
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'If a friendly unit left play this phase, distribute 3 Advantage tokens among friendly units. If a friendly leader unit left play this phase, distribute 5 Advantage tokens instead.',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.cardsLeftPlayThisPhaseWatcher.someUnitLeftPlay({ controller: context.player }),
                onTrue: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => this.cardsLeftPlayThisPhaseWatcher.someLeaderUnitLeftPlay({ controller: context.player }),
                    onTrue: AbilityHelper.immediateEffects.distributeAdvantageAmong({
                        amountToDistribute: 5,
                        canChooseNoTargets: false,
                        canDistributeLess: false,
                        cardTypeFilter: WildcardCardType.Unit,
                        controller: RelativePlayer.Self,
                    }),
                    onFalse: AbilityHelper.immediateEffects.distributeAdvantageAmong({
                        amountToDistribute: 3,
                        canChooseNoTargets: false,
                        canDistributeLess: false,
                        cardTypeFilter: WildcardCardType.Unit,
                        controller: RelativePlayer.Self,
                    })
                }),
            })
        });
    }
}