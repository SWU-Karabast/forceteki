import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Aspect, WildcardCardType } from '../../../core/Constants';
import * as Helpers from '../../../core/utils/Helpers';

export default class WithThunderousApplause extends EventCard {
    protected override getImplementationId () {
        return {
            id: '1156033141',
            internalName: 'with-thunderous-applause',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Command];
        registrar.setEventAbility({
            title: `Give a unit +2/+2 for this phase. You may disclose ${Helpers.aspectString(aspects)}. If you do, give another unit +2/+2 for this phase`,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
                })
            },
            then: (thenContext) => ({
                title: `Disclose ${Helpers.aspectString(aspects)} to give another unit +2/+2 for this phase`,
                immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
                ifYouDo: {
                    title: 'Give another unit +2/+2 for this phase',
                    targetResolver: {
                        cardTypeFilter: WildcardCardType.Unit,
                        cardCondition: (card) => card !== thenContext.target,
                        immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                            effect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
                        })
                    }
                }
            })
        });
    }
}