import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer, TargetMode, ZoneName } from '../../../core/Constants';

export default class LandoCalrissianCheckThisOut extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'lando-calrissian#check-this-out-id',
            internalName: 'lando-calrissian#check-this-out',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Return 3 friendly resources to their owner\'s hands. Then, you may resource up to 3 cards from your hand',
            targetResolver: {
                mode: TargetMode.ExactlyVariable,
                numCardsFunc: (context) => Math.min(3, context.player.resources.length),
                zoneFilter: ZoneName.Resource,
                controller: RelativePlayer.Self,
                immediateEffect: abilityHelper.immediateEffects.returnToHand()
            },
            then: {
                title: 'Resource up to 3 cards from your hand',
                targetResolver: {
                    mode: TargetMode.UpTo,
                    numCards: 3,
                    canChooseNoCards: true,
                    zoneFilter: ZoneName.Hand,
                    controller: RelativePlayer.Self,
                    immediateEffect: abilityHelper.immediateEffects.resourceCard()
                }
            }
        });
    }
}