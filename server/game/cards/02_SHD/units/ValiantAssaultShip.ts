import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ValiantAssaultShip extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7922308768',
            internalName: 'valiant-assault-ship'
        };
    }

    public override setupCardAbilities () {
        this.addOnAttackAbility({
            title: 'If the defending player controls more resources than you, this unit gets +2/+0 for this attack',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.controller.resources.length < context.source.controller.opponent.resources.length,
                onTrue: AbilityHelper.immediateEffects.forThisAttackCardEffect((context) => ({
                    target: context.source,
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
                })),
                onFalse: AbilityHelper.immediateEffects.noAction()
            })
        });
    }
}
