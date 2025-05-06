import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class JediSentinel extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5573238875',
            internalName: 'jedi-sentinel',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'Deal 2 damage to an enemy ground unit.',
            condition: (context) => context.player.hasTheForce,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel),
        });
    }
}
