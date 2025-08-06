import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class KananJarrusHelpUsSurvive extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8304104587',
            internalName: 'kanan-jarrus#help-us-survive',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Give a Shield token to a Creature or Spectre unit.',
            cost: [
                AbilityHelper.costs.abilityActivationResourceCost(1),
                AbilityHelper.costs.exhaustSelf(),
            ],
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait([Trait.Creature, Trait.Spectre]),
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you control another Creature or Spectre unit, this unit gets +2/+2.',
            condition: (context) => context.player.hasSomeArenaUnit({ trait: [Trait.Creature, Trait.Spectre], otherThan: context.source }),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
        });
    }
}