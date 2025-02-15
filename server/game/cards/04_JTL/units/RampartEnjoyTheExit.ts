import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityRestriction, PhaseName } from '../../../core/Constants';

export default class RampartEnjoyTheExit extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9720757803',
            internalName: 'rampart#enjoy-the-exit',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'This unit doesn\'t ready during the regroup phase unless its power is 4 or more',
            condition: (context) => context.source.getPower() < 4 && context.game.currentPhase === PhaseName.Regroup,
            ongoingEffect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.Ready),
        });
    }
}
