import type { IAbilityHelper } from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DefeatCardSystem } from '../../../gameSystems/DefeatCardSystem';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';


export default class FirstLightThreateningElegance extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'first-light#threatening-elegance-id',
            internalName: 'first-light#threatening-elegance'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Draw a card',
            optional: true,
            when: {
                onCardDefeated: (event, context) =>
                    event.isDefeatedByAttacker &&
                    DefeatCardSystem.defeatSourceCard(event) === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.draw((context) => ({ target: context.player }))
        });
    }
}