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
            title: 'Each friendly unit named 4-LOM gets +1/+1 and gains Saboteur',
            targetController: RelativePlayer.Self,
            matchTarget: (card, context) => card.controller === context.source.controller && card.isUnit() && card.title === '4-LOM',
            ongoingEffect: [
                AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 }),
                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur)
            ]
        });
    }
}

ZuckussBountyHunterForHire.implemented = true;
