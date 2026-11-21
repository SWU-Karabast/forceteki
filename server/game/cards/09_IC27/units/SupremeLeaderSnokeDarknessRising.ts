import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class SupremeLeaderSnokeDarknessRising extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3491132056',
            internalName: 'supreme-leader-snoke#darkness-rising',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 4 damage to each other unit. Draw a card for each friendly unit defeated this way',
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 4,
                target: context.game.getArenaUnits({ otherThan: context.source })
            })),
            then: (thenContext) => ({
                title: 'Draw a card for each friendly unit defeated this way',
                thenCondition: () => thenContext.resolvedEvents.some((e) => e.willDefeat && e.card.controller === thenContext.player),
                immediateEffect: AbilityHelper.immediateEffects.draw({
                    amount: thenContext.resolvedEvents.reduce((total, e) => total + (e.willDefeat && e.card.controller === thenContext.player ? 1 : 0), 0)
                })
            })
        });
    }
}