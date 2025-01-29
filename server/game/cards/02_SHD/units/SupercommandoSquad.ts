import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class SupercommandoSquad extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4341703515',
            internalName: 'supercommando-squad'
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'Gain sentinel while upgraded',
            condition: (context) => context.source.isUpgraded(),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}
