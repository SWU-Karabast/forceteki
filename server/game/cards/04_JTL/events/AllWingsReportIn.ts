import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class AllWingsReportIn extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6588309727',
            internalName: 'all-wings-report-in',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust up to 2 friendly space units. For each unit exhausted this way, create an X-Wing token',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 2,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.SpaceArena,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'For each unit exhausted this way, create an X-Wing token',
                immediateEffect: AbilityHelper.immediateEffects.createXWing((context) => ({
                    amount: ifYouDoContext.events?.filter((e) => e.resolutionStatus === 'resolved').length,
                    target: context.player
                }))
            }),
        });
    }
}
