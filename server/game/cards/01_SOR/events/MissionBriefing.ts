import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { TargetMode } from '../../../core/Constants';

export default class MissionBriefing extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7262314209',
            internalName: 'mission-briefing'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose a player. They draw 2 cards',
            targetResolver: {
                mode: TargetMode.Player,
                immediateEffect: AbilityHelper.immediateEffects.draw({ amount: 2 })
            }
        });
    }
}

MissionBriefing.implemented = true;
