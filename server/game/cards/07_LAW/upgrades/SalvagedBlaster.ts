import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait, WildcardCardType, ZoneName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsDiscardedThisPhaseWatcher } from '../../../stateWatchers/CardsDiscardedThisPhaseWatcher';

export default class SalvagedBlaster extends UpgradeCard {
    private cardsDiscardedThisPhaseWatcher: CardsDiscardedThisPhaseWatcher;

    protected override getImplementationId () {
        return {
            id: '7877015324',
            internalName: 'salvaged-blaster',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsDiscardedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsDiscardedThisPhase();
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addActionAbility({
            title: 'Play Salvaged Blaster from your discard pile',
            condition: (context) => this.cardsDiscardedThisPhaseWatcher.getCurrentValue().some((entry) =>
                entry.discardedFromPlayer === context.player &&
                entry.card === context.source &&
                entry.discardedPlayId === context.source.mostRecentInPlayId &&
                [ZoneName.Hand, ZoneName.Deck].includes(entry.discardedFromZone)
            ),
            immediateEffect: abilityHelper.immediateEffects.playCardFromOutOfPlay({ playAsType: WildcardCardType.Upgrade }),
            zoneFilter: ZoneName.Discard
        });
    }
}
