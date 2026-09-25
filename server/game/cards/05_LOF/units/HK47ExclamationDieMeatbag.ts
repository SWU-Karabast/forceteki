import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IGameStateGetter } from '../../../core/lki/GameStateGetter';

export default class HK47ExclamationDieMeatbag extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2407397504',
            internalName: 'hk47#exclamation-die-meatbag',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper, gameState: IGameStateGetter) {
        registrar.addTriggeredAbility({
            title: 'Deal 1 damage to its controller\'s base',
            when: {
                onCardDefeated: (event, context) => {
                    const defeated = gameState.getLastKnownProperties(event.cardRef);
                    return defeated.isUnit() && defeated.controller !== context.player;
                }
            },
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 1,
                // The controller at the moment it left play, which is not necessarily the controller
                // of the card now — it may since have been replayed by its owner.
                target: gameState.getLastKnownProperties(context.event.cardRef).controller.base,
            }))
        });
    }
}