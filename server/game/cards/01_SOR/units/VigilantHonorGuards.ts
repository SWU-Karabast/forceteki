import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class VigilantHonorGuards extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7622279662',
            internalName: 'vigilant-honor-guards'
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'Gain sentinel while undamaged',
            condition: (context) => context.source.damage === 0,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}
