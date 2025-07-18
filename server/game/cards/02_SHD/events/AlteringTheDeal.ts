import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { ZoneName } from '../../../core/Constants';

export default class AlteringTheDeal extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6425029011',
            internalName: 'altering-the-deal',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Discard a captured card guarded by a friendly unit',
            targetResolver: {
                zoneFilter: ZoneName.Capture,
                capturedByFilter: (context) => context.player.getArenaUnits(),
                immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard()
            }
        });
    }
}
