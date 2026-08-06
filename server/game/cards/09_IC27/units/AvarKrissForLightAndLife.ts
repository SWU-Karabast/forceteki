import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class AvarKrissForLightAndLife extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'avar-kriss#for-light-and-life-id',
            internalName: 'avar-kriss#for-light-and-life',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `This unit gains ${TextHelper.keyword({ keyword: KeywordName.Raid, amount: 1 })} for each other friendly unit`,
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword((t, c) => ({
                keyword: KeywordName.Raid,
                amount: c.player.getArenaUnits({ otherThan: c.source }).length
            }))
        });
    }
}