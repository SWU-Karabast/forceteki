import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IBaseAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { BaseCard } from '../../../core/card/BaseCard';
import { GameStateChangeRequired, RelativePlayer, ZoneName } from '../../../core/Constants';

export default class CitadelResearchCenter extends BaseCard {
    protected override getImplementationId() {
        return {
            id: 'citadel-research-center-id',
            internalName: 'citadel-research-center',
        };
    }

    public override setupCardAbilities(registrar: IBaseAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEpicActionAbility({
            title: 'Return a friendly resource to its owner\'s hand. If you do, resource the top card of your deck',
            cost: AbilityHelper.costs.abilityActivationResourceCost(1),
            immediateEffect: AbilityHelper.immediateEffects.selectCard({
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Resource,
                mustChangeGameState: GameStateChangeRequired.MustFullyResolve,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }),
            ifYouDo: {
                title: 'Put the top card of your deck into play as a resource',
                immediateEffect: AbilityHelper.immediateEffects.resourceCard((context) => ({
                    target: context.player.getTopCardOfDeck()
                }))
            }
        });
    }
}