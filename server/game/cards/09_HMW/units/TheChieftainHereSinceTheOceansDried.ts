import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class TheChieftainHereSinceTheOceansDried extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'the-chieftain#here-since-the-oceans-dried-id',
            internalName: 'the-chieftain#here-since-the-oceans-dried',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `This unit gains ${TextHelper.Raid(1)} for each other friendly ${TextHelper.Trait.Tusken} unit`,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword((target, context) => ({
                keyword: KeywordName.Raid,
                amount: context.player.getArenaUnits({ otherThan: target, trait: Trait.Tusken }).length
            }))
        });

        registrar.addConstantAbility({
            title: `While a friendly ${TextHelper.Trait.Tusken} unit is defending, it gets +1/+0 for each ${TextHelper.keyword(KeywordName.Raid)} it has`,
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: WildcardCardType.Unit,
            matchTarget: (card) =>
                card.isUnit() &&
                card.isInPlay() &&
                card.hasSomeTrait(Trait.Tusken) &&
                card.isDefending(),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats((target) => ({
                power: target.getNumericKeywordTotal(KeywordName.Raid) ?? 0,
                hp: 0
            }))
        });
    }
}
