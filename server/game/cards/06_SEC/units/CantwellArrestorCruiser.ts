import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityRestriction, Aspect, RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';
import * as Helpers from '../../../core/utils/Helpers';

export default class CantwellArrestorCruiser extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5577542957',
            internalName: 'cantwell-arrestor-cruiser',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Vigilance, Aspect.Vigilance, Aspect.Villainy];
        registrar.addWhenPlayedAbility({
            title: `Disclose ${Helpers.aspectString(aspects)} to exhaust an enemy unit. That unit cannot ready while this unit is in play`,
            immediateEffect: AbilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'Exhaust an enemy unit. That unit cannot ready while this unit is in play',
                targetResolver: {
                    controller: RelativePlayer.Opponent,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.exhaust(),
                        AbilityHelper.immediateEffects.whileSourceInPlayCardEffect({
                            effect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.Ready)
                        })
                    ])
                }
            }
        });
    }
}