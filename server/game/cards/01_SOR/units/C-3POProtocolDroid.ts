import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode } from '../../../core/Constants';


export default class C3POProtocolDroid extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8009713136',
            internalName: 'c3po#protocol-droid',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Choose a number',
            when: {
                onCardPlayed: (event, context) => event.card === context.source,
                onAttackDeclared: (event, context) => event.attack.attacker === context.source
            },
            targetResolver: {
                mode: TargetMode.DropdownList,
                options: Array.from({ length: 21 }, (x, i) => `${i}`),  // array of strings from 0 to 20
                condition: (context) => context.source.controller.drawDeck.length > 0   // skip ability if deck is empty
            },
            then: (thenContext) => ({
                title: 'Look at the top card of your deck',
                thenCondition: (context) => context.source.controller.drawDeck.length > 0,   // skip ability if deck is empty
                immediateEffect: AbilityHelper.immediateEffects.conditional((context) => {
                    const topCardOfDeck = context.player.getTopCardOfDeck();
                    return {
                        condition: parseInt(thenContext.select) === topCardOfDeck?.printedCost,
                        onTrue: AbilityHelper.immediateEffects.lookAtAndChooseOption((context) => ({
                            target: topCardOfDeck,
                            perCardButtons: [
                                {
                                    text: 'Reveal and Draw',
                                    arg: 'reveal-draw',
                                    immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                                        AbilityHelper.immediateEffects.drawSpecificCard(),
                                        AbilityHelper.immediateEffects.reveal({
                                            useDisplayPrompt: true,
                                            promptedPlayer: RelativePlayer.Opponent
                                        }),
                                    ])
                                },
                                {
                                    text: 'Leave on Top',
                                    arg: 'leave',
                                    immediateEffect: AbilityHelper.immediateEffects.noAction()
                                }
                            ]
                        })),
                        onFalse: AbilityHelper.immediateEffects.lookAt({
                            target: topCardOfDeck,
                            useDisplayPrompt: true
                        })
                    };
                })
            })
        });
    }
}
