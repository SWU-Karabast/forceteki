import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class StarfortressHeavyBomber extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6004226019',
            internalName: 'starfortress-heavy-bomber',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 6 damage to a non-unique unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                cardCondition: (card) => card.isUnit() && !card.unique,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 6 })
            }
        });
    }
}