import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class _4LOMBountyHunterForHire extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6097248635',
            internalName: '4lom#bounty-hunter-for-hire'
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'Each friendly unit named Zuckuss gets +1/+1 and gains Ambush',
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: WildcardCardType.Unit,
            matchTarget: (card, context) => card.controller === context.source.controller && card.title === 'Zuckuss',
            ongoingEffect: [
                AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 }),
                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush),
            ]
        });
    }
}

_4LOMBountyHunterForHire.implemented = true;
