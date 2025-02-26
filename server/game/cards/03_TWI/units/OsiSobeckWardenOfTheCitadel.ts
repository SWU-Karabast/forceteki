import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, ZoneName } from '../../../core/Constants';

export default class OsiSobeckWardenOfTheCitadel extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2041344712',
            internalName: 'osi-sobeck#warden-of-the-citadel',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'This unit captures an enemy non-leader ground unit with cost equal to or less than the number of resources paid to play this unit.',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                zoneFilter: ZoneName.GroundArena,
                cardCondition: (card, context) => card.hasCost() && card.cost <= context.event.costs.resources,
                immediateEffect: AbilityHelper.immediateEffects.capture()
            }
        });
    }
}
