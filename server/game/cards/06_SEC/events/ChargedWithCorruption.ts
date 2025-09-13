import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Aspect, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import * as Helpers from '../../../core/utils/Helpers';

export default class ChargedWithCorruption extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3414562805',
            internalName: 'charged-with-corruption',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Command, Aspect.Command];
        registrar.setEventAbility({
            title: `Disclose ${Helpers.aspectString(aspects)}. If you do, a friendly unit captures an enemy non-leader unit`,
            immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'A friendly unit captures an enemy non-leader unit',
                targetResolvers: {
                    friendlyUnit: {
                        controller: RelativePlayer.Self,
                        cardTypeFilter: WildcardCardType.Unit,
                    },
                    captureUnit: {
                        dependsOn: 'friendlyUnit',
                        controller: RelativePlayer.Opponent,
                        cardTypeFilter: WildcardCardType.NonLeaderUnit,
                        immediateEffect: abilityHelper.immediateEffects.capture((context) => ({
                            captor: context.targets.friendlyUnit
                        }))
                    }
                }
            }
        });
    }
}