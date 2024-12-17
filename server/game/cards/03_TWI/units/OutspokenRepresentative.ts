import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class OutspokenRepresentative extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '8919416985',
            internalName: 'outspoken-representative'
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While you control another Republic unit, this unit gains Sentinel.',
            condition: (context) => context.source.controller.isTraitInPlay(Trait.Republic, context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Sentinel })
        });

        this.addWhenDefeatedAbility({
            title: 'Create a Clone Trooper token.',
            immediateEffect: AbilityHelper.immediateEffects.createCloneTrooper()
        });
    }
}

OutspokenRepresentative.implemented = true;