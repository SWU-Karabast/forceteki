import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class JedhaAgitator extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1746195484',
            internalName: 'jedha-agitator',
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'If you control a leader unit, deal 2 damage to a ground unit or base',
            targetResolver: {
                cardCondition: (card) => (card.isUnit() && card.zoneName === ZoneName.GroundArena) || card.isBase(),
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.controller.leader.deployed,
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 2 }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                })
            }
        });
    }
}
