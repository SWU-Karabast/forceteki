import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class IncineratorTrooper extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4328408486',
            internalName: 'incinerator-trooper',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addConstantAbility({
            title: 'While attacking, this unit deals combat damage before the defender.',
            ongoingEffect: AbilityHelper.ongoingEffects.dealsDamageBeforeDefender(),
        });
    }
}
