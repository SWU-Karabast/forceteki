import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';
import type { IUpgradeCard } from '../../../core/card/CardInterfaces';

export default class KaydelConnixForOurSurvival extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '0602708575',
            internalName: 'kaydel-connix#for-our-survival',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Defeat all non-unique upgrades on a unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.defeat((context) => ({
                    target: context.target.upgrades.filter((upgrade: IUpgradeCard) => !upgrade.unique),
                }))
            }
        });
    }
}