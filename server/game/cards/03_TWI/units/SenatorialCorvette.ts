import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import AbilityHelper from '../../../AbilityHelper';

export default class SenatorialCorvette extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6404471739',
            internalName: 'senatorial-corvette',
        };
    }

    public override setupCardAbilities() {
        this.addWhenDefeatedAbility({
            title: 'The opponent discards a card from their hand',
            immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                target: context.source.controller.opponent,
                amount: 1
            })),
        });
    }
}
