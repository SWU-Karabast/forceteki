import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { ZoneName } from '../../../core/Constants';

export default class AlteringTheDeal extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6425029011',
            internalName: 'altering-the-deal',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Discard a captured card guarded by a friendly unit',
            targetResolver: {
                zoneFilter: ZoneName.Capture,
                capturedByFilter: (context) => context.source.controller.getArenaUnits(),
                immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard()
            }
        });
    }
}

AlteringTheDeal.implemented = true;
