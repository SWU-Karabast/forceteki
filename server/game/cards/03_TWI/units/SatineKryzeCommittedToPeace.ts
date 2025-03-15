import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, WildcardRelativePlayer } from '../../../core/Constants';

export default class SatineKryzeCommittedToPeace extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6384086894',
            internalName: 'satine-kryze#committed-to-peace',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'Each unit gains action: \'Exhaust this to discard cards from an opponent\'s deck equal to half its remaining HP, rounded up\'',
            targetController: WildcardRelativePlayer.Any,
            matchTarget: (card) => card.isUnit(),
            ongoingEffect: AbilityHelper.ongoingEffects.gainAbility({
                type: AbilityType.Action,
                title: 'Discard cards from an opponent\'s deck equal to half this unit\'s remaining HP, rounded up',
                cost: AbilityHelper.costs.exhaustSelf,
                immediateEffect: AbilityHelper.immediateEffects.discardFromDeck((context) => {
                    const remainingHp = context.source.isUnit() ? context.source.getHp() : 0;
                    return { amount: Math.ceil(remainingHp / 2) };
                })
            })
        });
    }
}
