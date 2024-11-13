import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Duration, KeywordName } from '../../../core/Constants';

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
                condition: (context) => context.event.attack.target.hasSomeKeyword(KeywordName.Bounty),
                onTrue: AbilityHelper.immediateEffects.cardLastingEffect((context) => ({
                    target: context.event.attack.target,
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -4, hp: 0 }),
                    duration: Duration.UntilEndOfAttack,
                })),
                onFalse: AbilityHelper.immediateEffects.noAction()
            })
        });
    }
}

ChainCodeCollector.implemented = true;
