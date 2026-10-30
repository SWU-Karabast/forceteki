import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, ZoneName } from '../../../core/Constants';

export default class KylosTieSilencerFollowMyLead extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'kylos-tie-silencer#follow-my-lead-id',
            internalName: 'kylos-tie-silencer#follow-my-lead',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'For this phase, you may play this unit from your discard pile',
            contextTitle: (context) => `For this phase, you may play ${context.source.title} from your discard pile`,
            zoneFilter: ZoneName.Discard,
            when: {
                onCardDiscarded: (event, context) =>
                    event.card === context.source &&
                    event.discardedFromZone === ZoneName.Hand,
            },
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                effect: AbilityHelper.ongoingEffects.canPlayFromDiscard({
                    player: RelativePlayer.Self
                })
            })
        });
    }
}