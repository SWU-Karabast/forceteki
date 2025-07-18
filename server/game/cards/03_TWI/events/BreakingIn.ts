import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName } from '../../../core/Constants';

export default class BreakingIn extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4910017138',
            internalName: 'breaking-in',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with a unit. It gets +2/+0 and gains Saboteur for this attack.',
            initiateAttack: {
                attackerLastingEffects: [
                    { effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur) },
                    { effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }) },
                ]
            }
        });
    }
}
