import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { TokenUpgradeCard } from '../../../core/card/TokenCards';
import type { ZoneName } from '../../../core/Constants';

export default class Advantage extends TokenUpgradeCard {
    protected override getImplementationId() {
        return {
            id: '5844562972',
            internalName: 'advantage',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        // This ability is intentionally not registered per-token via the standard zone lifecycle
        // (see updateTriggeredAbilitiesForZone below). Instead, a single game-level listener
        // registered in Game.registerGlobalRulesListeners invokes it for the Advantage tokens
        // involved in an attack, avoiding per-token listener overhead. See issue #2587.
        registrar.addTriggeredAbility({
            title: 'Defeat Advantage token',
            when: {
                onAttackEnd: (event, context) =>
                    event.attack.attacker === context.source.parentCard ||
                    event.attack.getAllTargets().includes(context.source.parentCard)
            },
            immediateEffect: AbilityHelper.immediateEffects.defeat()
        });
    }

    /**
     * Advantage's defeat ability is driven by the global attack-end rules listener in
     * {@link Game.registerGlobalRulesListeners} rather than by a persistent per-token listener,
     * so we skip the standard zone-based registration of its triggered abilities.
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected override updateTriggeredAbilitiesForZone(_from: ZoneName, _to: ZoneName): void { }

    public override isAdvantage(): this is Advantage {
        return true;
    }
}
