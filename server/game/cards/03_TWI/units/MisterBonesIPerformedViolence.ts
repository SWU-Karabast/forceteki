import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class MisterBonesIPerformedViolence extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7789777396',
            internalName: 'mister-bones#i-performed-violence',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addOnAttackAbility({
            title: 'Deal 3 damage to a ground unit',
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.hand.length === 0,
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 3 }),
                })
            }
        });
    }
}
