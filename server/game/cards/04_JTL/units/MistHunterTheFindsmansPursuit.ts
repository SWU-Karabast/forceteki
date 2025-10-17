import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';
import type { Player } from '../../../core/Player';
import { Trait } from '../../../core/Constants';

export default class MistHunterTheFindsmansPursuit extends NonLeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId () {
        return {
            id: '7192849828',
            internalName: 'mist-hunter#the-findsmans-pursuit',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar);
    }

    private hasPlayedASpecificTraitThisPhase(controller: Player) {
        return this.cardsPlayedThisPhaseWatcher.someCardPlayed((entry) => entry.playedBy === controller && entry.card.hasSomeTrait([Trait.BountyHunter, Trait.Pilot]));
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Draw a card',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.hasPlayedASpecificTraitThisPhase(context.player),
                onTrue: AbilityHelper.immediateEffects.draw((context) => ({ target: context.player })),
            }),
        });
    }
}
