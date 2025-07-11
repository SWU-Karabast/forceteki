import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Trait } from '../../../core/Constants';

export default class PunchIt extends EventCard {
    protected override getImplementationId () {
        return {
            id: '6413979593',
            internalName: 'punch-it',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Attack with a Vehicle unit. It gets +2/+0 for this attack',
            initiateAttack: {
                attackerCondition: (card) => card.hasSomeTrait(Trait.Vehicle),
                attackerLastingEffects: {
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
                }
            }
        });
    }
}
