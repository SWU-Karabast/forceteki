import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { PhaseName } from '../../../core/Constants';

export default class TheMandalorianLetsSeeThePuck extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7505293719',
            internalName: 'the-mandalorian#lets-see-the-puck',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Draw a card',
            immediateEffect: AbilityHelper.immediateEffects.draw()
        });
        registrar.addTriggeredAbility({
            title: 'Give a Shield token to The Mandalorian, Let\'s See the Puck',
            collectiveTrigger: true,
            when: {
                onCardsDrawn: (event, context) => event.player === context.player && context.game.currentPhase === PhaseName.Action,
            },
            immediateEffect: AbilityHelper.immediateEffects.giveShield()
        });
    }
}
