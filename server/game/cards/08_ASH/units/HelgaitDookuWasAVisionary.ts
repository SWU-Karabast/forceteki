import type { IAbilityHelper } from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';
import type { ICardStateGetter } from '../../../core/lki/CardStateGetter';

export default class HelgaitDookuWasAVisionary extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9419144933',
            internalName: 'helgait#dooku-was-a-visionary',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper, cardStates: ICardStateGetter) {
        registrar.addWhenDefeatedAbility({
            title: 'Distribute a number of Advantage tokens equal to this unit\'s power among friendly units',
            contextTitle: (context) => `Distribute ${this.powerWhenDefeated(context, cardStates)} Advantage tokens among friendly units`,
            immediateEffect: abilityHelper.immediateEffects.distributeAdvantageAmong({
                amountToDistribute: (context) => this.powerWhenDefeated(context, cardStates),
                canChooseNoTargets: true,
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
            })
        });
    }

    /**
     * This unit's power as of the moment it left play.
     *
     * If the ability was used without actually defeating it (e.g. via Chimaera), there is no record
     * and this reads live state instead. The reference is bound to the event rather than resolved
     * from the live card, so a unit that has since moved on to another zone or identity still
     * reads the right one (SC-13).
     */
    private powerWhenDefeated(context: TriggeredAbilityContext, cardStates: ICardStateGetter): number {
        return cardStates.getLastKnownProperties(context.event.cardRef)
            .asUnitCard()
            .asInPlay().power;
    }
}