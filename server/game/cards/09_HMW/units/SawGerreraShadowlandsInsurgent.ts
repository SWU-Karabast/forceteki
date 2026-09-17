import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class SawGerreraShadowlandsInsurgent extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3947921548',
            internalName: 'saw-gerrera#shadowlands-insurgent',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Resource the top card of your deck',
            when: {
                onCardPlayed: (event, context) => event.player !== context.player && event.card.isEvent(),
            },
            immediateEffect: AbilityHelper.immediateEffects.resourceCard((context) => ({ target: context.player.getTopCardOfDeck() }))
        });
    }
}