import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class HuntingAssassinDroid extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6206647829',
            internalName: 'hunting-assassin-droid',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While an enemy unit is damaged, this unit gains Raid 2',
            condition: (context) => context.player.opponent.hasSomeArenaUnit({ condition: (card) => card.isUnit() && card.damage > 0 }),
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 })
        });
    }
}
