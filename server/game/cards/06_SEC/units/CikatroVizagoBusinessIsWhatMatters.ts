import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class CikatroVizagoBusinessIsWhatMatters extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8580435842',
            internalName: 'cikatro-vizago#business-is-what-matters',
        };
    }

    public override setupCardAbilities(
        registrar: INonLeaderUnitAbilityRegistrar,
        AbilityHelper: IAbilityHelper
    ) {
        registrar.addOnAttackAbility({
            title: `Reveal the top card of your deck. Opponent pays ${TextHelper.resource(1)} or you draw that card.`,
            immediateEffect: AbilityHelper.immediateEffects.reveal((context) => ({
                useDisplayPrompt: true,
                promptedPlayer: RelativePlayer.Self,
                target: context.player.getTopCardOfDeck()
            })),
            then: (thenContext) => {
                const topCard = thenContext.player.getTopCardOfDeck();

                return {
                    title: `Opponent pays ${TextHelper.resource(1)} or you draw ${topCard?.title}`,
                    thenCondition: (context) => context.player.drawDeck.length > 0,
                    targetResolver: {
                        waitingPromptTitle: `Opponent is choosing whether to pay ${TextHelper.resource(1)} or let you draw ${topCard?.title}`,
                        mode: TargetMode.Select,
                        choosingPlayer: RelativePlayer.Opponent,
                        choices: {
                            [`Pay ${TextHelper.resource(1)}`]: AbilityHelper.immediateEffects.payResources({
                                target: thenContext.player.opponent,
                                amount: 1
                            }),
                            [`Opponent draws ${topCard?.title}`]: AbilityHelper.immediateEffects.drawSpecificCard({
                                target: topCard
                            })
                        }
                    }
                };
            }
        });
    }
}