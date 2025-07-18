import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, Trait, WildcardCardType } from '../../../core/Constants';

export default class PaladinTrainingCorvette extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7012130030',
            internalName: 'paladin-training-corvette',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give an Experience token to each of up to 3 Force units',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 3,
                canChooseNoCards: true,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Force),
                immediateEffect: AbilityHelper.immediateEffects.giveExperience({ amount: 1 })
            }
        });
    }
}
