import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class AggrievedParliamentarian extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2535372432',
            internalName: 'aggrieved-parliamentarian',
        };
    }

    public override setupCardAbilities() {
        // TODO need a target resolver for twin suns
        this.addWhenPlayedAbility({
            title: 'Your opponent shuffle their discard pile and put it on the bottom of their deck',
            immediateEffect: AbilityHelper.immediateEffects.moveToBottomOfDeck((context) => ({
                target: context.source.controller.opponent.getCardsInZone(ZoneName.Discard),
                shuffleMovedCards: true,
            }))
        });
    }
}

AggrievedParliamentarian.implemented = true;
