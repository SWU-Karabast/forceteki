import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer } from '../../../core/Constants';

export default class _4LOMBountyHunterForHire extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6097248635',
            internalName: '4lom#bounty-hunter-for-hire'
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'Deal 2 damage to each other ground unit',
            targetController: RelativePlayer.Self,
            matchTarget: (card) => card.isUnit() && card.title === 'Zuckuss',
            ongoingEffect: [
                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush),
                AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 })
            ]
        });
    }
}

_4LOMBountyHunterForHire.implemented = true;