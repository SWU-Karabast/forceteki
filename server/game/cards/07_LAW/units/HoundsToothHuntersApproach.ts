import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class HoundsToothHuntersApproach extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8331101999',
            internalName: 'hounds-tooth#hunters-approach',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenAttackEndsAbility({
            title: 'If this unit survived, you may defeat a unit with less power than this unit',
            optional: true,
            attackerMustSurvive: true,
            targetResolver: {
                activePromptTitle: (context) => `Defeat a unit with less than ${context.source.getPower()} power`,
                cardCondition: (card, context) => card.isUnit() && card.getPower() < context.source.getPower(),
                immediateEffect: abilityHelper.immediateEffects.defeat()
            }
        });
    }
}
