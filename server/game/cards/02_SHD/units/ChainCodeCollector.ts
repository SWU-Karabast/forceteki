import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class ChainCodeCollector extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7171636330',
            internalName: 'chain-code-collector'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addOnAttackAbility({
            title: 'If the defender has a Bounty, it gets –4/–0 for this attack',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.event.attack.targetIsUnit((card) => card.hasSomeKeyword(KeywordName.Bounty)),
                onTrue: AbilityHelper.immediateEffects.forThisAttackCardEffect((context) => ({
                    target: context.event.attack.getSingleTarget(),
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -4, hp: 0 }),
                })),
            })
        });
    }
}
