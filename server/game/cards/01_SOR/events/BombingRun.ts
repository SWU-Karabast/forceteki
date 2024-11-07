import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { TargetMode } from '../../../core/Constants';

export default class BombingRun extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7916724925',
            internalName: 'bombing-run',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Deal 3 damage to each unit in an arena',
            targetResolver: {
                mode: TargetMode.Arena,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => {
                    const allUnitsInArena = context.player.getUnitsInPlay(context.target)
                        .concat(context.player.opponent.getUnitsInPlay(context.target));
                    return { amount: 3, target: allUnitsInArena };
                })
            }
        });
    }
}

BombingRun.implemented = true;