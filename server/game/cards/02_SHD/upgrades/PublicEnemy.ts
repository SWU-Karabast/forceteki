import AbilityHelper from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class PublicEnemy extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '1780014071',
            internalName: 'public-enemy',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.addGainKeywordTargetingAttached({
            keyword: KeywordName.Bounty,
            ability: {
                title: 'Give a Shield token to a unit.',
                targetResolver: {
                    controller: WildcardRelativePlayer.Any,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.giveShield()
                }
            }
        });
    }
}
