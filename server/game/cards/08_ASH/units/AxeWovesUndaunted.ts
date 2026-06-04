import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class AxeWovesUndaunted extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9992086344',
            internalName: 'axe-woves#undaunted',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Give a Shield token to The Mandalorian, Let\'s See the Puck',
            collectiveTrigger: true,
            when: {
                onCardsDrawn: (event, context) => event.player === context.player,
            },
            immediateEffect: AbilityHelper.immediateEffects.giveAdvantage((context) => ({
                target: context.source
            }))
        });
    }
}