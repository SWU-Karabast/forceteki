import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class BWingSkirmisher extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4407141375',
            internalName: 'bwing-skirmisher',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 1 damage to each of up to 2 space units',
            targetResolver: {
                mode: TargetMode.UpTo,
                canChooseNoCards: true,
                numCards: 2,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.SpaceArena,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}