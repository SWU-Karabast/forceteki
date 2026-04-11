import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class FearlessAttack extends EventCard {
    protected override getImplementationId () {
        return {
            id: 'fearless-attack-id',
            internalName: 'fearless-attack',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with a unit. It gets +1/+0 for this attack for each unit controlled by the defending player.',
            initiateAttack: {
                attackerLastingEffects: (context, attack) => ({
                    effect: abilityHelper.ongoingEffects.modifyStats({
                        power: attack.getDefendingPlayer().getArenaUnits().length,
                        hp: 0,
                    })
                })
            }
        });
    }
}