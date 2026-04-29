import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class MortarTrooper extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'mortar-trooper-id',
            internalName: 'mortar-trooper',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Deal 1 damage to each of up to 3 units',
            cost: abilityHelper.costs.exhaustSelf(),
            targetResolver: {
                mode: TargetMode.UpTo,
                canChooseNoCards: true,
                numCards: 3,
                zoneFilter: ZoneName.GroundArena,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}