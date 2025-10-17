import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { DamageDealtThisPhaseWatcher } from '../../../stateWatchers/DamageDealtThisPhaseWatcher';
import { CardType, ZoneName } from '../../../core/Constants';

export default class TempestAssault extends EventCard {
    private damageDealtThisPhaseWatcher: DamageDealtThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: 'tempest-assault-id',
            internalName: 'tempest-assault',
        };
    }

    protected override setupStateWatchers (registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.damageDealtThisPhaseWatcher = AbilityHelper.stateWatchers.damageDealtThisPhase(registrar);
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 2 damage to each enemy space unit',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => this.damageDealtThisPhaseWatcher.playerHasDealtDamage(context.player, (entry) => entry.targetController === context.player.opponent && entry.targetType === CardType.Base),
                onTrue: abilityHelper.immediateEffects.damage((context) => ({
                    amount: 2,
                    target: context.player.opponent.getArenaUnits({ arena: ZoneName.SpaceArena })
                }))
            })
        });
    }
}