import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class CantinaBouncer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1021495802',
            internalName: 'cantina-bouncer',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Return a non-leader unit to its owner\'s hand.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand(),
            }
        });
    }
}

CantinaBouncer.implemented = true;
