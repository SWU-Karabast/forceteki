import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, ZoneName } from '../../../core/Constants';

export default class LightspeedAssault extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8606123385',
            internalName: 'lightspeed-assault',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Defeat a friendly space unit and deal its damage to an enemy space unit',
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.SpaceArena,
                immediateEffect: AbilityHelper.immediateEffects.sequential((context) => {
                    const friendlySpaceUnit = context.target;
                    return [
                        AbilityHelper.immediateEffects.defeat(),
                        AbilityHelper.immediateEffects.selectCard({
                            controller: RelativePlayer.Opponent,
                            zoneFilter: ZoneName.SpaceArena,
                            innerSystem: AbilityHelper.immediateEffects.damage({
                                amount: friendlySpaceUnit.getPower()
                            })
                        })
                    ];
                })
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Deal indirect damage equal to its power',
                ifYouDoCondition: (context) => context.events.length >= 2,
                immediateEffect: AbilityHelper.immediateEffects.indirectDamageToPlayer({
                    target: ifYouDoContext.player.opponent,
                    amount: ifYouDoContext.events[1].card.getPower() // TODO: do we need LKI?
                })
            })
        });
    }
}
