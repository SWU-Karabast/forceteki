import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class TheFatherMaintainingBalance extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1554637578',
            internalName: 'the-father#maintaining-balance',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'You may deal 1 damage to this unit. If you do, the Force is with you',
            when: {
                onForceUsed: (event, context) =>
                    event.player === context.player &&
                    !context.player.hasTheForce
            },
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 1,
                target: context.source
            })),
            ifYouDo: {
                title: 'The Force is with you',
                immediateEffect: AbilityHelper.immediateEffects.theForceIsWithYou()
            }
        });
    }
}