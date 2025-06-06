import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class SorcerousBlast extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6001143439',
            internalName: 'sorcerous-blast',
        };
    }

    protected override setupCardAbilities() {
        this.setEventAbility({
            title: 'Use the Force to deal 3 damage to a unit',
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Deal 3 damage to a unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 }),
                }
            }
        });
    }
}