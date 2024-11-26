import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class ConsortiumStarViper extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1611702639',
            internalName: 'consortium-starviper'
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'While you have the initiative, this unit gains Restore 2. (When this unit attacks, heal 2 damage from your base.)',
            condition: (context) => context.source.controller.hasInitiative(),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 2 }),
        });
    }
}

ConsortiumStarViper.implemented = true;
