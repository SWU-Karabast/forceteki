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

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'Deal 3 damage to a ground unit',
            targetResolver: {
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.controller.hand.length === 0,
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 3 }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                })
            }
        });
    }
}
