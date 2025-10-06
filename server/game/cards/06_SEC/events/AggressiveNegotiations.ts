import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class AggressiveNegotiations extends EventCard {
    protected override getImplementationId () {
        return {
            id: '5876721507',
            internalName: 'aggressive-negotiations',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with a unit. For this attack, it gets +1/+0 for each card in your hand',
            initiateAttack: {
                attackerLastingEffects: {
                    effect: abilityHelper.ongoingEffects.modifyStats((_, context) => ({
                        power: context.player.hand.length,
                        hp: 0,
                    }))
                }
            }
        });
    }
}