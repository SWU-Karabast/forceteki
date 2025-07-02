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

    public override setupCardAbilities(card: this) {
        card.addConstantAbility({
            title: 'While the Force is with you, this unit gains Sentinel.',
            condition: (context) => context.player.hasTheForce,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel),
        });
    }
}
