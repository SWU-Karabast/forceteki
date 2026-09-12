import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class C3POCaptivatingStoryteller extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'c3po#captivating-storyteller-id',
            internalName: 'c3po#captivating-storyteller'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Give an ${TextHelper.Trait.Ewok} unit +2/+2 for this phase. Give an ${TextHelper.Trait.Rebel} unit +2/+2 for this phase`,
            targetResolvers: {
                ewokUnit: {
                    optional: true,
                    activePromptTitle: `Give an ${TextHelper.Trait.Ewok} unit +2/+2 for this phase`,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card.hasSomeTrait(Trait.Ewok),
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 }),
                    }),
                },
                rebelUnit: {
                    optional: true,
                    activePromptTitle: `Give a ${TextHelper.Trait.Rebel} unit +2/+2 for this phase`,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card.hasSomeTrait(Trait.Rebel),
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 }),
                    }),
                }
            }
        });
    }
}
