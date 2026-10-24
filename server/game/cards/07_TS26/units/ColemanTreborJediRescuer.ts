import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import { EventName } from '../../../core/Constants';

export default class ColemanTreborJediRescuer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0571552412',
            internalName: 'coleman-trebor#jedi-rescuer',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        // THIS IMPLEMENTATION IS NOT ACCURATE FOR TWIN SUNS
        registrar.addWhenPlayedAbility({
            title: 'Deal 1 damage to each enemy base. Heal 1 damage from your base for each damage dealt this way',
            immediateEffect: abilityHelper.immediateEffects.damage((context) => ({ amount: 1, target: context.player.opponent.base })),

            // The heal matches the damage actually dealt, so preventing the damage (e.g. with Close the
            // Shield Gate) heals nothing. `ifYouDo` would still heal there: under `SWU 8.9` text replaced
            // by a replacement effect still counts as resolved.
            then: (thenContext) => ({
                title: 'Heal 1 damage from your base for each damage dealt this way',
                thenCondition: () => this.damageDealtBy(thenContext) > 0,
                immediateEffect: abilityHelper.immediateEffects.heal((context) => ({
                    amount: this.damageDealtBy(thenContext),
                    target: context.player.base
                })),
            })
        });
    }

    private damageDealtBy(context: AbilityContext): number {
        return context.resolvedEvents
            .filter((event) => event.name === EventName.OnDamageDealt)
            .reduce((total, event) => total + (event.damageDealt ?? 0), 0);
    }
}
