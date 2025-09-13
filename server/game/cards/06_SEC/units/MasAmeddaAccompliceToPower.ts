import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, Trait, WildcardCardType } from '../../../core/Constants';

export default class MasAmeddaAccompliceToPower extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7365023470',
            internalName: 'mas-amedda#accomplice-to-power',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give an Experience token to each of up to 2 other Official units',
            targetResolver: {
                mode: TargetMode.UpTo,
                canChooseNoCards: true,
                numCards: 2,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.isUnit() && card !== context.source && card.hasSomeTrait(Trait.Official),
                immediateEffect: abilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}
