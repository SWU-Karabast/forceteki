import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class DarthTyranusServantOfSidious extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'darth-tyranus#servant-of-sidious-id',
            internalName: 'darth-tyranus#servant-of-sidious'
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While the Force is with you, this unit gains Ambush',
            condition: (context) => context.player.hasTheForce,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
        });
    }
}