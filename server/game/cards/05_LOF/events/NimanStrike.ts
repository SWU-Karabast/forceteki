import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Trait } from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class NimanStrike extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5960134941',
            internalName: 'niman-strike',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: `Attack with a ${TextHelper.Trait.Force} unit, even if it's exhausted. It gets +1/+0 and can't attack bases for this attack.`,
            initiateAttack: {
                attackerCondition: (attacker) => attacker.hasSomeTrait(Trait.Force),
                targetCondition: (target) => target.isUnit(),
                allowExhaustedAttacker: true,
                attackerLastingEffects: {
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 }),
                }
            }
        });
    }
}