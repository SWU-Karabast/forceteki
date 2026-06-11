import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait, ZoneName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsDefeatedThisPhaseWatcher } from '../../../stateWatchers/CardsDefeatedThisPhaseWatcher';

export default class ThermalDetonator extends UpgradeCard {
    private cardsDefeatedThisPhaseWatcher: CardsDefeatedThisPhaseWatcher;
    protected override getImplementationId () {
        return {
            id: '4576623485',
            internalName: 'thermal-detonator'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsDefeatedThisPhase();
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addGainWhenDefeatedAbilityTargetingAttached({
            title: 'Deal 2 damage to each enemy ground unit',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => !context.event.lastKnownInformation.exhausted,
                onTrue: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: 2,
                    target: context.player.opponent.getArenaUnits({ arena: ZoneName.GroundArena })
                }))
            })
        });
    }
}