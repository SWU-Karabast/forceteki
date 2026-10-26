import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class PackGuardian extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0283253814',
            internalName: 'pack-guardian',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While this unit is ready, it gains ${TextHelper.Sentinel}`,
            condition: (context) => !context.source.exhausted,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}