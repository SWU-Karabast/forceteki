import AbilityHelper from '../../../AbilityHelper';
import { AbilityContext } from '../../../core/ability/AbilityContext';
import { EventCard } from '../../../core/card/EventCard';
import { TargetMode, WildcardCardType } from '../../../core/Constants';
import { ISelectTargetResolver } from '../../../TargetInterfaces';
import { GameSystem } from '../../../core/gameSystem/GameSystem';
import { IThenAbilityPropsWithSystems } from '../../../Interfaces';
import * as Contract from '../../../core/utils/Contract';

export default class DontGetCocky extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2202839291',
            internalName: 'dont-get-cocky',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose a unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                mustChangeGameState: false
            },
            then: (unitChosenContext) => ({
                title: 'Reveal the top card of your deck',
                immediateEffect: AbilityHelper.immediateEffects.reveal((context) => ({ target: context.source.controller.getTopCardOfDeck() })),
                then: this.thenAfterReveal(1, unitChosenContext)
            })
        });
    }

    private thenAfterReveal(cardsRevealedCount: number, contextWithUnitTarget: AbilityContext): IThenAbilityPropsWithSystems<AbilityContext> {
        Contract.assertTrue(cardsRevealedCount > 0 && cardsRevealedCount < 8, `Error in Don\'t Get Cocky implementation: thenAfterReveal called with invalid cardsRevealedCount ${cardsRevealedCount}`);
        if (cardsRevealedCount < 7) {
            const then: IThenAbilityPropsWithSystems<AbilityContext> = {
                title: 'Reveal the next card from your deck or stop revealing cards',
                targetResolver: {
                    mode: TargetMode.Select,
                    choices: {
                        ['Reveal another card']: AbilityHelper.immediateEffects.reveal((context) => ({ target: context.source.controller.getTopCardsOfDeck(7)[cardsRevealedCount] })),
                        ['Stop revealing cards']: this.afterStopRevealingEffect(cardsRevealedCount, contextWithUnitTarget)
                    }
                },
                then: this.thenAfterReveal(cardsRevealedCount + 1, contextWithUnitTarget)
            };
            if (cardsRevealedCount > 1) {
                then.thenCondition = (context) => context.select === 'Reveal another card';
            }
            return then;
        }
        // cardsRevealedCount === 7
        return {
            title: 'Deal damage equal to the chosen unit equal to the total cost of cards revealed, if it is 7 or less',
            immediateEffect: this.afterStopRevealingEffect(7, contextWithUnitTarget)
        };
    }

    private choiceAfterReveal(cardsRevealedCount: number, thenContext: AbilityContext): ISelectTargetResolver<AbilityContext> {
        const targetResolver: ISelectTargetResolver<AbilityContext> = {
            mode: TargetMode.Select,
            choices: {
                ['Reveal another card']: AbilityHelper.immediateEffects.reveal((context) => ({ target: context.source.controller.getTopCardsOfDeck(7)[cardsRevealedCount] })),
                ['Stop revealing cards']: this.afterStopRevealingEffect(cardsRevealedCount, thenContext)
            }
        };
        if (cardsRevealedCount > 1) {
            const previousTargetResolverName = 'choiceAfterCard'.concat((cardsRevealedCount - 1).toString());
            targetResolver.dependsOn = previousTargetResolverName;
            targetResolver.condition = (context) => context.selects[previousTargetResolverName] === 'Reveal another card';
        }

        return targetResolver;
    }

    private afterStopRevealingEffect(cardsRevealedCount: number, contextWithUnitTarget: AbilityContext): GameSystem<AbilityContext> {
        return AbilityHelper.immediateEffects.simultaneous((context) => {
            const totalCost = context.source.controller.getTopCardsOfDeck(cardsRevealedCount).reduce((total, card) => total + card.printedCost, 0);
            return [
                AbilityHelper.immediateEffects.conditional({
                    condition: totalCost <= 7,
                    onTrue: AbilityHelper.immediateEffects.damage({ target: contextWithUnitTarget.target, amount: totalCost }),
                    onFalse: AbilityHelper.immediateEffects.noAction()

                }),
                AbilityHelper.immediateEffects.moveToBottomOfDeck({ target: context.source.controller.getTopCardsOfDeck(cardsRevealedCount) })
            ];
        });
    }

    private findHowManyCardsWereRevealed(context: AbilityContext) {
        for (const selectTargetResolverResult of context.selects) {
            if (selectTargetResolverResult === 'Stop revealing cards') {
                return;
            }
        }
    }
}

DontGetCocky.implemented = true;
