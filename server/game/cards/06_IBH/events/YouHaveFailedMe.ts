import { type IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class YouHaveFailedMe extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4187779775',
            internalName: 'you-have-failed-me',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Defeat a friendly unit. If you do, ready a friendly unit with 5 or less power',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: abilityHelper.immediateEffects.defeat()
            },
            ifYouDo: {
                title: 'Ready a friendly unit with 5 or less power',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    cardCondition: (card) => card.isUnit() && card.getPower() <= 5,
                    immediateEffect: abilityHelper.immediateEffects.ready()
                }
            }
        });
    }
}