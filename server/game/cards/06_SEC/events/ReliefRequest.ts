import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Aspect, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelpers';

export default class ReliefRequest extends EventCard {
    protected override getImplementationId () {
        return {
            id: '4944397020',
            internalName: 'relief-request',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Vigilance];
        registrar.setEventAbility({
            title: TextHelper.performReplacements(`Heal 3 damage from a unit. You may disclose ${TextHelper.aspectList(aspects)}. If you do, heal 3 damage from another unit`),
            immediateEffect: abilityHelper.immediateEffects.selectCard({
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.heal({ amount: 3 }),
            }),
            then: (thenContext) => ({
                title: TextHelper.performReplacements(`Disclose ${TextHelper.aspectList(aspects)} to give heal 3 damage from another unit`),
                immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
                ifYouDo: {
                    title: 'Heal 3 damage from another unit',
                    targetResolver: ({
                        cardTypeFilter: WildcardCardType.Unit,
                        cardCondition: (card) => card !== thenContext.target,
                        immediateEffect: abilityHelper.immediateEffects.heal({ amount: 3 }),
                    }),
                }
            })
        });
    }
}