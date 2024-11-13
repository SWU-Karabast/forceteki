import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class OutlawCorona extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3503780024',
            internalName: 'outlaw-corona'
        };
    }

    public override setupCardAbilities () {
        this.addBountyAbility({
            title: 'Put the top card of your deck into play as a resource.',
            immediateEffect: AbilityHelper.immediateEffects.resourceCard((context) => ({ target: context.player.getTopCardOfDeck() }))
        });
    }
}

OutlawCorona.implemented = true;
