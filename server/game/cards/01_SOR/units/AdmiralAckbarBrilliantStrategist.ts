import AbilityHelper from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class AdmiralAckbarBrilliantStrategist extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0827076106',
            internalName: 'admiral-ackbar#brilliant-strategist'
        };
    }

    /**
     * Determines the number of units in the ability's target unit arena.
     * @param context The context from the ability.
     * @returns The number of units in target units arena.
     */
    private getDamageFromContext(context: AbilityContext): number {
        const arenaName = context.target.zoneName;
        const arena = context.player.getArenaUnits({ arena: arenaName });
        return arena.length;
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Deal damage to a unit equal to the number of units your control in its arena.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({ amount: this.getDamageFromContext(context) })),
            },
        });
    }
}
