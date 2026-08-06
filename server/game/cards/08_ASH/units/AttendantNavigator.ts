import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class AttendantNavigator extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4232049843',
            internalName: 'attendant-navigator',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give 2 Advantage tokens to a space unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.SpaceArena,
                immediateEffect: abilityHelper.immediateEffects.giveAdvantage({ amount: 2 })
            }
        });
    }
}