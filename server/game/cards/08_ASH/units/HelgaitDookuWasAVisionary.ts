import type { IAbilityHelper } from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';
import type { IGameStateGetter } from '../../../core/lki/GameStateGetter';

export default class HelgaitDookuWasAVisionary extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9419144933',
            internalName: 'helgait#dooku-was-a-visionary',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper, gameState: IGameStateGetter) {
        // Power as of the moment this unit left play. If the ability was used without actually
        // defeating it (e.g. via Chimaera), there is no record and this reads live state instead.
        const powerWhenDefeated = (context: TriggeredAbilityContext) =>
            gameState.getLastKnownProperties(context.event.card).asUnit()
                .asInPlay().power;

        registrar.addWhenDefeatedAbility({
            title: 'Distribute a number of Advantage tokens equal to this unit\'s power among friendly units',
            contextTitle: (context) => `Distribute ${powerWhenDefeated(context)} Advantage tokens among friendly units`,
            immediateEffect: abilityHelper.immediateEffects.distributeAdvantageAmong((context) => ({
                amountToDistribute: powerWhenDefeated(context),
                canChooseNoTargets: true,
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
            }))
        });
    }
}