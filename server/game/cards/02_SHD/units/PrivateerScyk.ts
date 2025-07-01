import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, KeywordName } from '../../../core/Constants';

export default class PrivateerScyk extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '0088477218',
            internalName: 'privateer-scyk',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addConstantAbility({
            title: 'While you control another Cunning unit, this unit gains Shielded',
            condition: (context) => context.player.isAspectInPlay(Aspect.Cunning, context.source),
            matchTarget: (card, context) => card === context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Shielded)
        });
    }
}
