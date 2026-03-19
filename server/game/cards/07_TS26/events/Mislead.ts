import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class Mislead extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7387838286',
            internalName: 'mislead',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.setEventAbility({
            title: 'Give a Shield token to a unit. Give a unit –3/–0 for this phase.',
            targetResolvers: {
                shield: {
                    activePromptTitle: 'Give a Shield token to a unit',
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: abilityHelper.immediateEffects.giveShield()
                },
                unit: {
                    activePromptTitle: 'Give a unit –3/–0 for this phase',
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: abilityHelper.ongoingEffects.modifyStats({ power: -3, hp: -0 })
                    })
                }
            }
        });
    }
}