import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, DamageModificationType, WildcardCardType } from '../../../core/Constants';

export default class FinnOnTheRun extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7244268162',
            internalName: 'finn#on-the-run',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackCompletedAbility({
            title: 'For this phase, if damage would be dealt to that unit, prevent 1 of that damage',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.unique,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainAbility({
                        title: 'For this phase, if damage would be dealt to that unit, prevent 1 of that damage',
                        type: AbilityType.DamageModification,
                        modificationType: DamageModificationType.Reduce,
                        amount: 1
                    })
                })
            }
        });
    }
}
