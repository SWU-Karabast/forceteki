import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class PadmeAmidalaPursuingPeace extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8307804692',
            internalName: 'padme-amidala#pursuing-peace',
        };
    }

    public override setupCardAbilities() {
        this.addCoordinateAbility({
            type: AbilityType.Triggered,
            title: 'Give an enemy unit -3/-0 for this phase.',
            when: {
                onAttack: true,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -3, hp: -0 }),
                }),
            }
        });
    }
}
