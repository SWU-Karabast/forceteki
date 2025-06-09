import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class TuskenTracker extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1548886844',
            internalName: 'tusken-tracker',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Each enemy unit loses Hidden for this phase',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                target: context.source.controller.opponent.getArenaUnits(),
                effect: AbilityHelper.ongoingEffects.loseKeyword(KeywordName.Hidden)
            })),
        });
    }
}