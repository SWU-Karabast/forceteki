import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class AccelerateOurPlans extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6471963627',
            internalName: 'accelerate-our-plans',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust a friendly unit. If you do, attack with another unit. It gets +3/+0 for this attack.',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.exhaust()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Attack with another unit. It gets +3/+0 for this attack.',
                initiateAttack: {
                    attackerCondition: (card) => card !== ifYouDoContext.events[0].card,
                    attackerLastingEffects: {
                        effect: abilityHelper.ongoingEffects.modifyStats({ power: 3, hp: 0 })
                    }
                }
            })
        });
    }
}