import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class OpenFire extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8148673131',
            internalName: 'open-fire',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Deal 4 damage to a unit.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 4 }),
            }
        });
    }
}
