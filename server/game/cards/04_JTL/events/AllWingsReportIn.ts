import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, TargetMode, ZoneName } from '../../../core/Constants';

export default class AllWingsReportIn extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6588309727',
            internalName: 'all-wings-report-in',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Exhaust up to 2 friendly space units. For each unit exhausted this way, create an X-Wing token',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 2,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.SpaceArena,
                cardCondition: (card) => card.isUnit() && !card.exhausted,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.exhaust((context) => ({
                        target: context.target
                    })),
                    AbilityHelper.immediateEffects.createXWing((context) => ({ amount: context.target.length, target: this.controller }))
                ])
            },
        });
    }
}
