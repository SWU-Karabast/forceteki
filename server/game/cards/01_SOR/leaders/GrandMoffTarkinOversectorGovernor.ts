import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class GrandMoffTarkinOversectorGovernor extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2912358777',
            internalName: 'grand-moff-tarkin#oversector-governor',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Give an experience token to an Imperial unit',
            cost: [AbilityHelper.costs.abilityActivationResourceCost(1), AbilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardCondition: (card) => card.hasSomeTrait(Trait.Imperial),
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Give an experience token to another Imperial unit',
            optional: true,
            targetResolver: {
                cardCondition: (card, context) => card.hasSomeTrait(Trait.Imperial) && card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}
