import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, EffectName, RelativePlayer } from '../../../core/Constants';
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
            targetCardTypeFilter: CardType.TokenUnit,
            ongoingEffect: OngoingEffectBuilder.card.static(EffectName.EntersPlayReady)
        });

        this.addOnAttackAbility({
            title: 'Create a Clone Trooper token.',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: () => this.cardsLeftPlayThisPhaseWatcher.someCardLeftPlay({ filter: (entry) => entry.card.isUnit() }),
                onTrue: AbilityHelper.immediateEffects.createCloneTrooper(),
                onFalse: AbilityHelper.immediateEffects.noAction()
            })
        });
    }
}
