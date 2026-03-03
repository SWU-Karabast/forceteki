import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Aspect, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelpers';

export default class BogDownInProcedure extends EventCard {
    protected override getImplementationId () {
        return {
            id: '9326222198',
            internalName: 'bog-down-in-procedure',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Cunning];
        registrar.setEventAbility({
            title: TextHelper.performReplacements(`Exhaust a unit. You may disclose ${TextHelper.aspectList(aspects)}. If you do, exhaust another unit`),
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.exhaust()
            },
            then: (thenContext) => ({
                title: TextHelper.performReplacements(`Disclose ${TextHelper.aspectList(aspects)} to exhaust another unit`),
                immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
                ifYouDo: {
                    title: 'Exhaust another unit',
                    targetResolver: {
                        cardTypeFilter: WildcardCardType.Unit,
                        cardCondition: (card) => card !== thenContext.target,
                        immediateEffect: abilityHelper.immediateEffects.exhaust()
                    }
                }
            })
        });
    }
}