import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { PhaseName } from '../../../core/Constants';

export default class ChirrutImweOneWithTheForce extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4263394087',
            internalName: 'chirrut-imwe#one-with-the-force',
        };
    }

    protected override setupLeaderSideAbilities() {
        // test
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addConstantAbility({
            title: 'During the action phase, this unit isn\'t defeated by having no remaining HP',
            ongoingEffect: AbilityHelper.ongoingEffects.cannotBeDefeatedByDamage(),
            condition: (context) => context.game.currentPhase === PhaseName.Action
        });
    }
}

ChirrutImweOneWithTheForce.implemented = true;
