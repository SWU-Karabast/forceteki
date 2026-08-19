import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ViceAdmiralRampartANewEraOfSafety extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'vice-admiral-rampart#a-new-era-of-safety-id',
            internalName: 'vice-admiral-rampart#a-new-era-of-safety',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addReplacementEffectAbility({
            title: 'Defeat this unit to prevent an upgrade on your base from being defeated',
            optional: true,
            when: {
                onCardDefeated: (event, context) =>
                    context.player.base.upgrades.includes(event.card)
            },
            onlyIfYouDoEffect: AbilityHelper.immediateEffects.defeat()
        });
    }
}
