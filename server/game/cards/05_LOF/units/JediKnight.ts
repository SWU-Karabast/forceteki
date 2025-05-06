import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, ZoneName } from '../../../core/Constants';

export default class JediKnight extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5737712611',
            internalName: 'jedi-knight',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Deal 2 damage to an enemy ground unit.',
            targetResolver: {
                zoneFilter: ZoneName.GroundArena,
                controller: RelativePlayer.Opponent,
                condition: (context) => context.player.hasInitiative(),
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
            }
        });
    }
}
