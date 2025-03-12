import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { KeywordName } from '../../../core/Constants';

export default class TimelyReinforcements extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2301911685',
            internalName: 'timely-reinforcements',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'For every 2 resources your opponent control, create an X-Wing token.',
            immediateEffect: AbilityHelper.immediateEffects.createXWing((context) => ({
                amount: Math.floor(context.player.opponent.resources.length / 2),
                target: context.player,
            })),
            then: (thenContext) => ({
                title: 'Give them Sentinel for this phase',
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Sentinel }),
                    target: thenContext.events[0].card,
                })
            })
        });
    }
}

