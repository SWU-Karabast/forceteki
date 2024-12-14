import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType } from '../../../core/Constants';

export default class OOMSeriesOfficer extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6022703929',
            internalName: 'oomseries-officer'
        };
    }

    public override setupCardAbilities() {
        this.addWhenDefeatedAbility({
            title: 'Deal 2 damage to a base.',
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
            }
        });
    }
}

OOMSeriesOfficer.implemented = true;