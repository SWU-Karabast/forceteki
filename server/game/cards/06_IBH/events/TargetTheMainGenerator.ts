import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { ZoneName } from '../../../core/Constants';
import { type IAbilityHelper } from '../../../AbilityHelper';

export default class TargetTheMainGenerator extends EventCard {
    protected override getImplementationId () {
        return {
            id: '8290455967',
            internalName: 'target-the-main-generator',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 2 damage to a base',
            targetResolver: {
                zoneFilter: ZoneName.Base,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 2 }),
            }
        });
    }
}