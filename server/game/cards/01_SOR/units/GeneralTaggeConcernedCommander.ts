import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class GeneralTaggeConcernedCommander extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7929181061',
            internalName: 'general-tagge#concerned-commander'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Give an experience token to each of up to 3 ${TextHelper.Trait.Trooper} units`,
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 3,
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Trooper),
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}
