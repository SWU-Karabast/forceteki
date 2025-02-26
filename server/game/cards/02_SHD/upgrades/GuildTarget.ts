import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { CardType, KeywordName } from '../../../core/Constants';

export default class GuildTarget extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '2740761445',
            internalName: 'guild-target',
        };
    }

    public override setupCardAbilities() {
        this.addGainKeywordTargetingAttached({
            keyword: KeywordName.Bounty,
            ability: {
                title: 'Deal 2 damage to a base. If the Bounty unit is unique, deal 3 damage instead',
                targetResolver: {
                    cardTypeFilter: CardType.Base,
                    immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({ amount: context.source.unique ? 3 : 2 })),
                }
            }
        });
    }
}
