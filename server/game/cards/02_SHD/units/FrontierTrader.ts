import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, ZoneName } from '../../../core/Constants';

export default class FrontierTrader extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8095362491',
            internalName: 'frontier-trader'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Return a resource you control to your hand. If you do, put the top card of your deck into play as a resource.',
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.Resource,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            },
            ifYouDo: (context) => ({
                title: 'Put the top card of your deck into play as a resource',
                optional: true,
                immediateEffect: AbilityHelper.immediateEffects.resourceCard({ target: context.player.getTopCardOfDeck() })
            })
        });
    }
}
