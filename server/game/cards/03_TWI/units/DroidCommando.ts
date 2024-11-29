import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class DroidCommando extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6999668340',
            internalName: 'droid-commando'
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While you control another Separatist unit, this unit gains Ambush',
            condition: (context) => context.source.controller.isTraitInPlay(Trait.Separatist, context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
        });
    }
}

DroidCommando.implemented = true;
