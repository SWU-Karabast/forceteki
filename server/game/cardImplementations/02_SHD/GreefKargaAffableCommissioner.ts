import AbilityHelper from '../../AbilityHelper';
import { NonLeaderUnitCard } from '../../core/card/NonLeaderUnitCard';
import { CardType, Location } from '../../core/Constants';

export default class GreefKargaAffableCommissioner extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6884078296',
            internalName: 'greef-karga#affable-commissioner'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Search the top 5 cards of your deck for an upgrade, then reveal and draw it.',
            optional: false,
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                cardsToSearch: 5,
                cardCondition: (card) => card.type === CardType.Upgrade,
                immediateEffect: AbilityHelper.immediateEffects.moveCard({
                    destination: Location.Hand
                })
            })
        });
    }
}

GreefKargaAffableCommissioner.implemented = true;