import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class SeparatistCommando extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5027991609',
            internalName: 'separatist-commando'
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While you control another Separatist unit, this unit gains Raid 2',
            condition: (context) => context.source.controller.isTraitInPlay(Trait.Separatist, context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 })
        });
    }
}

SeparatistCommando.implemented = true;
