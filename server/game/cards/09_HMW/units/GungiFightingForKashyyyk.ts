import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, ZoneName } from '../../../core/Constants';

export default class GungiFightingForKashyyyk extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2319392742',
            internalName: 'gungi#fighting-for-kashyyyk',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Discard a card from your hand to ready this unit',
            optional: true,
            when: {
                onDamageDealt: (event, context) =>
                    !event.willDefeat &&
                    event.card === context.source
            },
            targetResolver: {
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                immediateEffect: abilityHelper.immediateEffects.discardSpecificCard()
            },
            ifYouDo: {
                title: 'Ready this unit',
                immediateEffect: abilityHelper.immediateEffects.ready()
            }
        });
    }
}