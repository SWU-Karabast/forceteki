import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Aspect, KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class OmegaCloseYourEyesAndFocus extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'omega#close-your-eyes-and-focus-id',
            internalName: 'omega#close-your-eyes-and-focus',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: `Attack with a ${TextHelper.Heroism} unit. It gains ${TextHelper.Grit} for this attack.`,
            cost: [abilityHelper.costs.abilityActivationResourceCost(1), abilityHelper.costs.exhaustSelf()],
            initiateAttack: {
                attackerCondition: (card) => card.hasSomeAspect(Aspect.Heroism),
                attackerLastingEffects: {
                    effect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Grit),
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `Other friendly ${TextHelper.Heroism} units gains ${TextHelper.Grit}`,
            matchTarget: (card, context) => card !== context.source && card.isUnit() && card.hasSomeAspect(Aspect.Heroism),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Grit)
        });
    }
}