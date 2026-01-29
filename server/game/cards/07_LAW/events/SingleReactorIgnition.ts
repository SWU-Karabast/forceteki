import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventName } from '../../../core/Constants';
import type { Player } from '../../../core/Player';
import { isUnit } from '../../../core/utils/EnumHelpers';

export default class SingleReactorIgnition extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5657954810',
            internalName: 'single-reactor-ignition',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Defeat all units. Deal 1 damage to the opponent\'s base for each defeated unit.',
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.defeat((context) => ({
                    target: context.game.getArenaUnits()
                })),
                AbilityHelper.immediateEffects.damage((context) => ({ // TSTODO: this will need to be updated to damage multiple bases based on the number of units defeated
                    amount: this.getOpponentBaseDamage(context.player, context.events),
                    target: context.player.opponent.base
                }))
            ])
        });
    }

    private getOpponentBaseDamage(player: Player, events: any[]): number {
        const defeatedEnemyUnits: any[] = [];
        events.forEach((event) => {
            if (!event.isCancelled && event.name === EventName.OnCardDefeated && event.lastKnownInformation.controller === player.opponent && isUnit(event.lastKnownInformation.type)) {
                defeatedEnemyUnits.push(event.card);
            }
        });
        return defeatedEnemyUnits.length;
    }
}
