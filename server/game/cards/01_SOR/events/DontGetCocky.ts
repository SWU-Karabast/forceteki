import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { TargetMode, WildcardCardType } from '../../../core/Constants';
import type { GameSystem } from '../../../core/gameSystem/GameSystem';
import type { IThenAbilityPropsWithSystems } from '../../../Interfaces';
import * as Contract from '../../../core/utils/Contract';

export default class DontGetCocky extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2202839291',
            internalName: 'dont-get-cocky',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        // TODO: Consolidate this to a single prompt that includes the revealed cards and
        //       Reveal Another Card/Stop Revealing Cards options
        registrar.setEventAbility({
            title: 'Choose a unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit
            },
            then: (unitChosenContext) => ({
                title: 'Reveal the top card of your deck',
                immediateEffect: AbilityHelper.immediateEffects.reveal((context) => ({
                    useDisplayPrompt: true,
                    target: context.player.getTopCardOfDeck()
                })),
                then: this.thenAfterReveal(1, unitChosenContext, AbilityHelper)
            })
        });
    }

    private thenAfterReveal(cardsRevealedCount: number, contextWithUnitTarget: AbilityContext, AbilityHelper: IAbilityHelper): IThenAbilityPropsWithSystems<AbilityContext> {
        Contract.assertTrue(cardsRevealedCount > 0 && cardsRevealedCount < 8, `Error in Don't Get Cocky implementation: thenAfterReveal called with invalid cardsRevealedCount ${cardsRevealedCount}`);
        const deckLength = contextWithUnitTarget.player.drawDeck.length;
        if (cardsRevealedCount === 7 || cardsRevealedCount >= deckLength) {
            return {
                title: 'Deal damage equal to the chosen unit equal to the total cost of cards revealed, if it is 7 or less',
                immediateEffect: this.afterStopRevealingEffect(7, contextWithUnitTarget, AbilityHelper)
            };
        }
        const then: IThenAbilityPropsWithSystems<AbilityContext> = {
            title: 'Reveal the next card from your deck or stop revealing cards',
            targetResolver: {
                activePromptTitle: `Current total cost: ${this.topXCardsTotalCost(cardsRevealedCount, contextWithUnitTarget)}\nSelect one:`,
                mode: TargetMode.Select,
                choices: {
                    ['Reveal another card']: AbilityHelper.immediateEffects.reveal((context) => ({
                        useDisplayPrompt: true,
                        target: context.player.getTopCardsOfDeck(1 + cardsRevealedCount)
                    })),
                    ['Stop revealing cards']: this.afterStopRevealingEffect(cardsRevealedCount, contextWithUnitTarget, AbilityHelper)
                }
            },
            then: this.thenAfterReveal(cardsRevealedCount + 1, contextWithUnitTarget, AbilityHelper)
        };
        if (cardsRevealedCount > 1) {
            then.thenCondition = (context) => context.select === 'Reveal another card';
        }
        return then;
    }

    private afterStopRevealingEffect(cardsRevealedCount: number, contextWithUnitTarget: AbilityContext, AbilityHelper: IAbilityHelper): GameSystem<AbilityContext> {
        return AbilityHelper.immediateEffects.simultaneous((context) => {
            const totalCost = this.topXCardsTotalCost(cardsRevealedCount, contextWithUnitTarget);
            return [
                AbilityHelper.immediateEffects.conditional({
                    condition: totalCost <= 7,
                    onTrue: AbilityHelper.immediateEffects.damage({ target: contextWithUnitTarget.target, amount: totalCost }),
                }),
                AbilityHelper.immediateEffects.moveToBottomOfDeck({ target: context.player.getTopCardsOfDeck(cardsRevealedCount) })
            ];
        });
    }

    private topXCardsTotalCost(cardsRevealedCount: number, context: AbilityContext) {
        return context.player.getTopCardsOfDeck(cardsRevealedCount).reduce((total, card) => total + card.printedCost, 0);
    }
}
