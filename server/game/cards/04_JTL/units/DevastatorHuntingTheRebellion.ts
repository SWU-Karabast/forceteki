import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class DevastatorHuntingTheRebellion extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1330473789',
            internalName: 'devastator#hunting-the-rebellion',
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'You assign all indirect damage you deal to opponents',
            ongoingEffect: AbilityHelper.ongoingEffects.assignIndirectDamageDealtToOpponents(),
        });

        this.addWhenPlayedAbility({
            title: 'Deal 4 indirect damage to each opponent',
            immediateEffect: AbilityHelper.immediateEffects.indirectDamageToPlayer((context) => ({
                amount: 4,
                target: context.source.controller.opponent,
            })),
        });
    }
}
