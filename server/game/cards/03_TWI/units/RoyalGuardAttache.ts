import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class RoyalGuardAttache extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '0598115741',
            internalName: 'royal-guard-attache'
        };
    }

    public override setupCardAbilities(card: this) {
        card.addWhenPlayedAbility({
            title: 'Deal 2 damage to this unit',
            immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
        });
    }
}
