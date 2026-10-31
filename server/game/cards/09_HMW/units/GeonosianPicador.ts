import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class GeonosianPicador extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0790563774',
            internalName: 'geonosian-picador',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Creat a Beast token',
            immediateEffect: AbilityHelper.immediateEffects.createBeast(),
            then: {
                title: 'Give a Weakness token to a friendly unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    immediateEffect: AbilityHelper.immediateEffects.giveWeakness()
                }
            }
        });
    }
}