import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityRestriction, KeywordName } from '../../../core/Constants';

export default class DookuItIsTooLate extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3052907071',
            internalName: 'dooku#it-is-too-late',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Each friendly unit with Hidden can\'t be attacked this phase',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                target: context.player.getArenaUnits({ condition: (card) => card.hasSomeKeyword(KeywordName.Hidden) }),
                effect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.BeAttacked)
            }))
        });
    }
}