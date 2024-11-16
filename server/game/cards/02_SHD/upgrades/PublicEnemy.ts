import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class PublicEnemy extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '1780014071',
            internalName: 'public-enemy',
        };
    }

    public override setupCardAbilities() {
        this.addGainKeywordTargetingAttached({
            keyword: KeywordName.Bounty,
            ability: {
                title: 'Give a Shield token to a unit.',
                targetResolver: {
                    controller: RelativePlayer.Any,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.giveShield()
                }
            }
        });
    }
}

PublicEnemy.implemented = true;
