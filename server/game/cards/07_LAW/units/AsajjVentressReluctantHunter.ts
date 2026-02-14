import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class AsajjVentressReluctantHunter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'asajj-ventress#reluctant-hunter-id',
            internalName: 'asajj-ventress#reluctant-hunter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Ready another Bounty Hunter unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.hasSomeTrait(Trait.BountyHunter) && card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.ready(),
            }
        });
    }
}