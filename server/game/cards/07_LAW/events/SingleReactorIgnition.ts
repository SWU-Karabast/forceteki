import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventName } from '../../../core/Constants';
import { EnumHelpers } from '../../../core/utils/EnumHelpers';
import type { AbilityContext } from '../../../core/ability/AbilityContext';

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
            immediateEffect: AbilityHelper.immediateEffects.defeat((context) => ({
                target: context.game.getArenaUnits()
            })),
            then: (thenContext) => ({
                title: `Deal ${this.getOpponentBaseDamage(thenContext)} damage to opponent's base`,
                immediateEffect: AbilityHelper.immediateEffects.damage({
                    // TSTODO: this will need to be updated to damage multiple bases based on the number of units defeated
                    target: thenContext.player.opponent.base,
                    amount: this.getOpponentBaseDamage(thenContext)
                })
            })
        });
    }

    private getOpponentBaseDamage(context: AbilityContext): number {
        return context.events.reduce((damage, event) => {
            if (!event.isCancelled && event.name === EventName.OnCardDefeated && event.lastKnownInformation.controller === context.player.opponent && EnumHelpers.isUnit(event.lastKnownInformation.type)) {
                return damage + 1;
            }
            return damage;
        }, 0);
    }
}
