import AbilityHelper from '../../AbilityHelper';
import { PlayableCard } from '../../core/card/CardTypes';
import { NonLeaderUnitCard } from '../../core/card/NonLeaderUnitCard';
import { Location, RelativePlayer, Trait, WildcardCardType } from '../../core/Constants';
import { CardsPlayedThisPhaseWatcher } from '../../core/stateWatcher/CardsPlayedThisPhaseWatcher';
import { StateWatcherRegistrar } from '../../core/stateWatcher/StateWatcherRegistrar';

export default class VanguardAce extends NonLeaderUnitCard {
    private cardsPlayedThisWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '3018017739',
            internalName: 'vanguard-ace',
        };
    }

    protected override setupStateWatchers(stateWatcherRegistrar: StateWatcherRegistrar) {
        this.cardsPlayedThisWatcher = new CardsPlayedThisPhaseWatcher(
            stateWatcherRegistrar,
            this,
            (card: PlayableCard) => card.controller === this.owner
        );
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Give 2 experience tokens to a friendly Imperial unit',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.hasSomeTrait(Trait.Imperial) && card !== this,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}

VanguardAce.implemented = true;
