import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { GameStateChangeRequired, RelativePlayer, ZoneName } from '../../../core/Constants';

export default class ImaGunDiHoldingOutForResupply extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'imagun-di#holding-out-for-resupply-id',
            internalName: 'imagun-di#holding-out-for-resupply'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'If you control fewer resources than an opponent, you may resource a card from your hand. If you do, resource the top card of your deck.',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.resources.length < context.player.opponent.resources.length,
                onTrue: AbilityHelper.immediateEffects.selectCard({
                    optional: true,
                    activePromptTitle: 'Select a card from your hand to resource. If you do, resource the top card of your deck.',
                    controller: RelativePlayer.Self,
                    zoneFilter: ZoneName.Hand,
                    mustChangeGameState: GameStateChangeRequired.MustFullyResolve,
                    effect: 'put a card from their hand into play as a resource',
                    immediateEffect: AbilityHelper.immediateEffects.resourceCard()
                }),
            }),
            ifYouDo: {
                title: 'Resource the top card of your deck.',
                immediateEffect: AbilityHelper.immediateEffects.resourceCard((context) => ({
                    target: context.player.getTopCardOfDeck()
                })),
            }
        });
    }
}