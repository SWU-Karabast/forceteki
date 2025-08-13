import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, ZoneName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';

export default class MillenniumFalconLandosPride extends NonLeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '5752414373',
            internalName: 'millennium-falcon#landos-pride',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'This unit gains Ambush if it was played from hand',
            condition: (context) => context.source.isInPlay() && this.cardsPlayedThisPhaseWatcher.someCardPlayed((entry) => entry.card === context.source && entry.inPlayId === context.source.inPlayId && entry.originalZone === ZoneName.Hand),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
        });
    }
}
