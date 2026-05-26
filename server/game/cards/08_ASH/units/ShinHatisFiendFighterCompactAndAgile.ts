import type { IAbilityHelper } from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';
import { DefeatSourceType } from '../../../IDamageOrDefeatSource';

export default class ShinHatisFiendFighterCompactAndAgile extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'shin-hatis-fiend-fighter#compact-and-agile-id',
            internalName: 'shin-hatis-fiend-fighter#compact-and-agile',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Give 2 Advantage tokens to a unit, or 3 instead if this unit wasn\'t defeated by combat damage',
            contextTitle: (context) => `Give ${this.getAdvantageTokenAmount(context)} Advantage tokens to a unit`,
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.giveAdvantage((context) => ({
                    amount: this.getAdvantageTokenAmount(context)
                }))
            }
        });
    }

    private getAdvantageTokenAmount(context: TriggeredAbilityContext) {
        return context.event.defeatSource.type === DefeatSourceType.Attack ? 2 : 3;
    }
}
