import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { PhaseName, WildcardCardType } from '../../../core/Constants';

export default class ChirrutImweOneWithTheForce extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4263394087',
            internalName: 'chirrut-imwe#one-with-the-force',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Give a unit +0/+2 for this phase',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 0, hp: 2 })
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'During the action phase, this unit isn\'t defeated by having no remaining HP',
            ongoingEffect: AbilityHelper.ongoingEffects.cannotBeDefeatedByDamage(),
            condition: (context) => context.game.currentPhase === PhaseName.Action
        });
    }
}
