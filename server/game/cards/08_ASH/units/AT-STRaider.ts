import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class ATSTRaider extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2614961429',
            internalName: 'atst-raider'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Gain Ambush while you control another non-unique unit',
            condition: (context) => context.player.getArenaUnits({ otherThan: context.source }).some((unit) => !unit.unique),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
        });
    }
}