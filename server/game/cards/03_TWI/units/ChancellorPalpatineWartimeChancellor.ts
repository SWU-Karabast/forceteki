import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EffectName, RelativePlayer } from '../../../core/Constants';
import { OngoingEffectBuilder } from '../../../core/ongoingEffect/OngoingEffectBuilder';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsLeftPlayThisPhaseWatcher } from '../../../stateWatchers/CardsLeftPlayThisPhaseWatcher';

export default class ChancellorPalpatineWartimeChancellor extends NonLeaderUnitCard {
    private cardsLeftPlayThisPhaseWatcher: CardsLeftPlayThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '0038286155',
            internalName: 'chancellor-palpatine#wartime-chancellor',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.cardsLeftPlayThisPhaseWatcher = AbilityHelper.stateWatchers.cardsLeftPlayThisPhase(registrar, this);
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'Each token unit you create enters play ready.',
            targetController: RelativePlayer.Self,
            ongoingEffect: OngoingEffectBuilder.player.static(EffectName.TokenUnitsEnterPlayReady)
        });

        registrar.addOnAttackAbility({
            title: 'Create a Clone Trooper token.',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: () => this.cardsLeftPlayThisPhaseWatcher.someUnitLeftPlay({}),
                onTrue: AbilityHelper.immediateEffects.createCloneTrooper(),
            })
        });
    }
}
