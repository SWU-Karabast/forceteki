import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class FinnStandAndFight extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'finn#stand-and-fight-id',
            internalName: 'finn#stand-and-fight',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `Gain ${TextHelper.Restore(2)} while upgraded`,
            condition: (context) => context.source.isUpgraded(),
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 2 })
        });
    }
}