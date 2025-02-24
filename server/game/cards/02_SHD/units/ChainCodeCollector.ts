import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class ChainCodeCollector extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7171636330',
            internalName: 'chain-code-collector'
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'If the defender has a Bounty, it gets –4/–0 for this attack',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => {
                    const target = context.event.attack.target;
                    return target.isUnit() && target.hasSomeKeyword(KeywordName.Bounty);
                },
                onTrue: AbilityHelper.immediateEffects.forThisAttackCardEffect((context) => ({
                    target: context.event.attack.target,
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -4, hp: 0 }),
                })),
            })
        });
    }
}
