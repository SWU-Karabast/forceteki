import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { AbilityType, KeywordName, Trait } from '../../../core/Constants';

export default class ForTheRepublic extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '7884488904',
            internalName: 'for-the-republic',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addDecreaseCostAbility({
            title: 'If you control 3 or more Republic units, this upgrade costs 2 less to play.',
            amount: 2,
            condition: (context) => context.player.getArenaUnits({ trait: Trait.Republic }).length >= 3,
        });

        registrar.addGainKeywordTargetingAttached({
            keyword: KeywordName.Coordinate,
            ability: {
                title: 'Gain Restore 2',
                type: AbilityType.Constant,
                ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({
                    keyword: KeywordName.Restore,
                    amount: 2,
                })
            }
        });
    }
}
