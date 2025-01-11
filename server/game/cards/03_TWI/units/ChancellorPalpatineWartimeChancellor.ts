import AbilityHelper from '../../../AbilityHelper';
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

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'Each token unit you create enters play ready.',
            targetController: RelativePlayer.Self,
            matchTarget: (card) => card.isTokenUnit(),
            ongoingEffect: OngoingEffectBuilder.card.static(EffectName.EntersPlayReady)
        });

        this.addOnAttackAbility({
            title: 'If a unit left play this phase, create a Clone Trooper token.',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => {
                    const controllerHasUnitsThatLeftPlayThisPhase = this.cardsLeftPlayThisPhaseWatcher.someCardLeftPlayControlledByPlayer({ controller: context.source.controller, filter: (entry) => entry.card.isUnit() });
                    const opponentHasUnitsThatLeftPlayThisPhase = this.cardsLeftPlayThisPhaseWatcher.someCardLeftPlayControlledByPlayer({ controller: context.source.controller.opponent, filter: (entry) => entry.card.isUnit() });
                    return opponentHasUnitsThatLeftPlayThisPhase || controllerHasUnitsThatLeftPlayThisPhase;
                },
                onTrue: AbilityHelper.immediateEffects.createCloneTrooper(),
                onFalse: AbilityHelper.immediateEffects.noAction()
            })
        });
    }
}

ChancellorPalpatineWartimeChancellor.implemented = true;
