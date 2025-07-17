import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class DuchesssChampion extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7289764651',
            internalName: 'duchesss-champion'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Gain Sentinel while an opponent controls 3 or more units',
            condition: (context) => context.player.opponent.getArenaUnits().length >= 3,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}
