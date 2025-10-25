import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName } from '../../../core/Constants';

export default class OneWayOut extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5820487880',
            internalName: 'one-way-out',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with a unit. It gets +1/+0 and gains Overwhelm for this attack. If it is attacking a unit, the defender loses all abilities for this attack',
            initiateAttack: {
                attackerLastingEffects: [
                    { effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm) },
                    { effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 }) },
                ],
                defenderLastingEffects: [
                    { effect: AbilityHelper.ongoingEffects.loseAllAbilities() },
                ]
            }
        });
    }
}