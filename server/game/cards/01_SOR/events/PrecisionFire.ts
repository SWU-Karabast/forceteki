import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { KeywordName, Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class PrecisionFire extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9210902604',
            internalName: 'precision-fire',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: `Attack with a unit. It gains ${TextHelper.Saboteur} for this attack. If it’s a Trooper, it also gets +2/+0 for this attack.`,
            initiateAttack: {
                attackerLastingEffects: [
                    { effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur) },
                    {
                        condition: (attack) => attack.attacker.hasSomeTrait(Trait.Trooper),
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                    },
                ],
            }
        });
    }
}
