import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode } from '../../../core/Constants';

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
            title: 'Reveal the top card of your deck. Opponent pays 1 resource or you draw that card.',
            immediateEffect: AbilityHelper.immediateEffects.reveal((context) => ({
                useDisplayPrompt: true,
                promptedPlayer: RelativePlayer.Self,
                target: context.player.getTopCardOfDeck()
            })),
            then: (thenContext) => {
                const topCard = thenContext.player.getTopCardOfDeck();

                return {
                    title: `Opponent pays 1 resource or you draw ${topCard?.title}`,
                    thenCondition: (context) => context.player.drawDeck.length > 0,
                    targetResolver: {
                        waitingPromptTitle: `Opponent is choosing whether to pay 1 resource or let you draw ${topCard?.title}`,
                        mode: TargetMode.Select,
                        choosingPlayer: RelativePlayer.Opponent,
                        choices: {
                            ['Pay 1 resource']: AbilityHelper.immediateEffects.payResourceCost({
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