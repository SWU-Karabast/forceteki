import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class ZamWesellInconspicuousAssassin extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'zam-wesell#inconspicuous-assassin-id',
            internalName: 'zam-wesell#inconspicuous-assassin',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While this unit is upgraded, she gains Grit',
            condition: (context) => context.source.isUpgraded(),
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Grit)
        });
    }
}
