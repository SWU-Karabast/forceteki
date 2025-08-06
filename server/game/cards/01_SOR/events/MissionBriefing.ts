import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { TargetMode } from '../../../core/Constants';

export default class MissionBriefing extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7262314209',
            internalName: 'mission-briefing'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Choose a player. They draw 2 cards',
            targetResolver: {
                mode: TargetMode.Player,
                immediateEffect: AbilityHelper.immediateEffects.draw({ amount: 2 })
            }
        });
    }
}
