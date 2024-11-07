import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { TargetMode } from '../../../core/Constants';

export default class Outmaneuver extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7366340487',
            internalName: 'outmaneuver',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Exhaust each unit in an arena',
            targetResolver: {
                mode: TargetMode.Arena,
                immediateEffect: AbilityHelper.immediateEffects.exhaust((context) => {
                    const allUnitsInArena = context.player.getUnitsInPlay(context.target)
                        .concat(context.player.opponent.getUnitsInPlay(context.target));
                    return { target: allUnitsInArena };
                })
            }
        });
    }
}

Outmaneuver.implemented = true;