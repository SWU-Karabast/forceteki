import type { IAbilityHelper } from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';
import { Contract } from '../../../core/utils/Contract';

export default class HelgaitDookuWasAVisionary extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9419144933',
            internalName: 'helgait#dooku-was-a-visionary',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Distribute a number of Advantage tokens equal to this unit\'s power among friendly units',
            contextTitle: (context) => `Distribute ${this.powerWhenDefeated(context)} Advantage tokens among friendly units`,
            immediateEffect: abilityHelper.immediateEffects.distributeAdvantageAmong((context) => ({
                amountToDistribute: this.powerWhenDefeated(context),
                canChooseNoTargets: true,
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
            }))
        });
    }

    /**
     * This unit's power at the moment it left play. Reading it through the game state getter means
     * the value comes from the last known information captured at that instant, or from live state
     * if the ability was used without actually defeating this unit.
     */
    private powerWhenDefeated(context: TriggeredAbilityContext): number {
        const defeated = this.gameState.getPropertiesOrLki(context.event.card);

        Contract.assertTrue(defeated.isUnit() && defeated.isInPlay());
        return defeated.power;
    }
}