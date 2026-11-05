import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer, ZoneName } from '../../../core/Constants';

export default class JangoFettStraightShooter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'jango-fett#straight-shooter-id',
            internalName: 'jango-fett#straight-shooter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Discard a card from your hand. If you do, return an event from your discard pile to your hand',
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard(),
            },
            ifYouDo: {
                title: 'Return an event from your discard pile to your hand',
                targetResolver: {
                    controller: RelativePlayer.Self,
                    cardTypeFilter: CardType.Event,
                    zoneFilter: ZoneName.Discard,
                    immediateEffect: AbilityHelper.immediateEffects.returnToHand(),
                },
            }
        });
    }
}
