import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class YordFandarDevoutlyDisciplined extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'yord-fandar#devoutly-disciplined-id',
            internalName: 'yord-fandar#devoutly-disciplined',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While a base has 15 or more damage on it, this unit gains ${TextHelper.Sentinel}`,
            condition: (context) => context.player.base.damage >= 15 || context.player.opponent.base.damage >= 15,
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}