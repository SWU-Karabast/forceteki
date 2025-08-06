import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class ZuckussBountyHunterForHire extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1690726274',
            internalName: 'zuckuss#bounty-hunter-for-hire'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each friendly unit named 4-LOM gets +1/+1 and gains Saboteur',
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: WildcardCardType.Unit,
            matchTarget: (card, context) => card.controller === context.player && card.title === '4-LOM',
            ongoingEffect: [
                AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 }),
                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur)
            ]
        });
    }
}
