import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class DesertSharpshooter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3381567608',
            internalName: 'desert-sharpshooter',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 2 damage to an upgraded ground unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                cardCondition: (card) => card.isUnit() && card.isUpgraded(),
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 2 })
            }
        });
    }
}