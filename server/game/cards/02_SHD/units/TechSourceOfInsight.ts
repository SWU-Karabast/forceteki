import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class TechSourceOfInsight extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3881257511',
            internalName: 'tech#source-of-insight'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each friendly resource gains Smuggle',
            targetZoneFilter: ZoneName.Resource,
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: WildcardCardType.Any,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword((target) => ({
                keyword: KeywordName.Smuggle,
                cost: target.cost + 2,
                aspects: target.aspects
            }))
        });
    }
}
