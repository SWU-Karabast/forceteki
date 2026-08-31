import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { PhaseName } from '../../../core/Constants';

export default class CrosshairIveChanged extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'crosshair#ive-changed-id',
            internalName: 'crosshair#ive-changed'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Each player draws a card',
            when: {
                onDamageDealt: (event, context) =>
                    !event.willDefeat &&
                    event.card === context.source
            },
            immediateEffect: abilityHelper.immediateEffects.draw((context) => ({
                target: context.game.getPlayers()
            }))
        });

        registrar.addTriggeredAbility({
            title: 'Deal 2 damage to opponent\'s base',
            collectiveTrigger: true,
            when: {
                onCardsDrawn: (event, context) =>
                    event.player === context.player.opponent && context.game.currentPhase === PhaseName.Action,
            },
            immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                amount: 2,
                target: context.player.opponent.base
            }))
        });
    }
}
