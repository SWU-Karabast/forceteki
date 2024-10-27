import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer } from '../../../core/Constants';

export default class ZuckussBountyHunterForHire extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1690726274',
            internalName: 'zuckuss#bounty-hunter-for-hire'
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'Deal 2 damage to each other ground unit',
            targetController: RelativePlayer.Self,
            matchTarget: (card) => card.isUnit() && card.title === '4-L0M',
            ongoingEffect: [
                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur),
                AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 })
            ]
        });
    }
}

ZuckussBountyHunterForHire.implemented = true;
