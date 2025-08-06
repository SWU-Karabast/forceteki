import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class BrightHopeTheLastTransport extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6253392993',
            internalName: 'bright-hope#the-last-transport'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Return a friendly non-leader ground unit to its owner\'s hand. If you do, draw a card',
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            },
            ifYouDo: {
                title: 'Draw a card',
                immediateEffect: AbilityHelper.immediateEffects.draw()
            }
        });
    }
}
