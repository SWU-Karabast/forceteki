import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, KeywordName } from '../../../core/Constants';

export default class CloneCommanderCodyCommandingThe212th extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9017877021',
            internalName: 'clone-commander-cody#commanding-the-212th',
        };
    }

    public override setupCardAbilities() {
        this.addCoordinateAbility({
            title: 'Each other friendly unit gets +1/+1 and gains Overwhelm',
            type: AbilityType.Constant,
            matchTarget: (card, context) => card !== context.source,
            ongoingEffect: [
                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm),
                AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 }),
            ]
        });
    }
}
