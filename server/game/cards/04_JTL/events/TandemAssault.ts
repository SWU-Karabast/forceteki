import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { ZoneName } from '../../../core/Constants';

export default class TandemAssault extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4334684518',
            internalName: 'tandem-assault',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Attack with a space unit. If you do, attack with a ground unit, that unit gets +2/+0 for this attack',
            initiateAttack: {
                attackerCondition: (card) => card.zoneName === ZoneName.SpaceArena
            },
            ifYouDo: {
                title: 'Attack with a ground unit, that unit gets +2/+0 for this attack',
                initiateAttack: {
                    attackerCondition: (card) => card.zoneName === ZoneName.GroundArena,
                    attackerLastingEffects: {
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                    }
                }
            }
        });
    }
}