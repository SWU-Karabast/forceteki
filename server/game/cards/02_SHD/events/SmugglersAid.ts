import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { CardType, RelativePlayer } from '../../../core/Constants';

export default class SmugglersAid extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0866321455',
            internalName: 'smugglers-aid',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Heal 3 damage from your base',
            targetResolver: {
                cardTypeFilter: CardType.Base,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 3 })
            }
        });
    }
}

SmugglersAid.implemented = true;