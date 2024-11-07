import { AbilityContext } from '../core/ability/AbilityContext';
import { DamageType, PlayType } from '../core/Constants';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import { GameSystem } from '../core/gameSystem/GameSystem';
import * as GameSystems from '../gameSystems/GameSystemLibrary';
import { ExecuteHandlerSystem } from '../gameSystems/ExecuteHandlerSystem';
import { ISelectCardProperties } from '../gameSystems/SelectCardSystem';
import { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';
import { Derivable, derive } from '../core/utils/Helpers';
import { Card } from '../core/card/Card';
import { ICost } from '../core/cost/ICost';
import { GameSystemCost } from '../core/cost/GameSystemCost';
import { MetaActionCost } from '../core/cost/MetaActionCost';
import { PlayCardResourceCost } from './PlayCardResourceCost';
import { ReturnToHandFromPlaySystem } from '../gameSystems/ReturnToHandFromPlaySystem';
// import { TargetDependentFateCost } from './costs/TargetDependentFateCost';
import Player from '../core/Player';

type SelectCostProperties<TContext extends AbilityContext = AbilityContext> = Omit<ISelectCardProperties<TContext>, 'innerSystem'>;

function getSelectCost<TContext extends AbilityContext = AbilityContext>(
    gameSystem: CardTargetSystem<TContext>,
    properties: undefined | SelectCostProperties<TContext>,
    activePromptTitle: string
) {
    return new MetaActionCost<TContext>(
        GameSystems.selectCard(Object.assign({ innerSystem: gameSystem }, properties)),
        activePromptTitle
    );
}

/**
 * Cost that will bow the card that initiated the ability.
 */
export function exhaustSelf<TContext extends AbilityContext = AbilityContext>(): ICost<TContext> {
    return new GameSystemCost<TContext>(GameSystems.exhaust<TContext>({ isCost: true }));
}

// /**
//  * Cost that will sacrifice the card that initiated the ability.
//  */
// export function sacrificeSelf(): Cost {
//     return new GameSystemCost(GameSystems.sacrifice());
// }

/**
 * Cost that requires defeating a card that matches the passed condition
 * predicate function.
 */
export function defeat<TContext extends AbilityContext = AbilityContext>(properties: SelectCostProperties<TContext>): ICost<TContext> {
    return getSelectCost(GameSystems.defeat<TContext>(), properties, 'Select card to defeat');
}

/**
 * Cost that requires dealing the given amount of damage to a card that matches
 * the passed condition predicate function.
 */
export function dealDamage<TContext extends AbilityContext = AbilityContext>(amount: number, properties: SelectCostProperties<TContext>): ICost<TContext> {
    return getSelectCost(GameSystems.damage<TContext>({ type: DamageType.Ability, amount: amount }), properties, `Select card to deal ${amount} damage to`);
}

/**
 * Cost that will return to hand from the play area the card that initiated the ability
 */
export function returnSelfToHandFromPlay<TContext extends AbilityContext = AbilityContext>(): ICost<TContext> {
    return new GameSystemCost<TContext>(GameSystems.returnToHandFromPlay({ isCost: true }));
}

// /**
//  * Cost that will return a selected card to hand from any area which matches the passed condition
//  * @deprecated This has not yet been tested
//  */
// export function returnToHand(properties: SelectCostProperties): ICost {
//     return getSelectCost(GameSystems.returnToHand(), properties, 'Select card to return to hand');
// }

// /**
//  * Simplified version of {@link returnToHand} that will return a selected card to hand from the
//  * play area which matches the passed condition
//  * @deprecated This has not yet been tested
//  */
// export function returnToHandFromPlay(properties: SelectCostProperties): ICost {
//     return getSelectCost(GameSystems.returnToHandFromPlay(), properties, 'Select card to return to hand');
// }

// /**
//  * Cost that will return a selected card to the appropriate deck which matches the passed
//  * condition.
//  */
// export function returnToDeck(properties: ReturnToDeckProperties & SelectCostProperties): Cost {
//     return getSelectCost(GameSystems.returnToDeck(properties), properties, 'Select card to return to your deck');
// }

// /**
//  * Cost that will return to hand the card that initiated the ability.
//  */
// export function returnSelfToHand(): Cost {
//     return new GameSystemCost(GameSystems.returnToHand());
// }

// /**
//  * Cost that will shuffle a selected card into the relevant deck which matches the passed
//  * condition.
//  * @deprecated This has not yet been tested
//  */
// export function shuffleIntoDeck(properties: SelectCostProperties): ICost {
//     return getSelectCost(
//         GameSystems.moveCard({ destination: Location.Deck, shuffle: true }),
//         properties,
//         'Select card to shuffle into deck'
//     );
// }

// /**
//  * Cost that requires discarding a specific card.
//  */
// export function discardCardSpecific(cardFunc: (context: AbilityContext) => BaseCard): Cost {
//     return new GameSystemCost(GameSystems.discardCard((context) => ({ target: cardFunc(context) })));
// }

// /**
//  * Cost that requires discarding itself from hand.
//  */
// export function discardSelf(): Cost {
//     return new GameSystemCost(GameSystems.discardCard((context) => ({ target: context.source })));
// }

// /**
//  * Cost that requires discarding a card to be selected by the player.
//  */
// export function discardCard(properties?: SelectCostProperties): Cost {
//     return getSelectCost(
//         GameSystems.discardCard(),
//         Object.assign({ location: Location.Hand, mode: TargetMode.Exactly }, properties),
//         (properties?.numCards ?? 0) > 1 ? `Select ${properties.numCards} cards to discard` : 'Select card to discard'
//     );
// }

// /** @deprecated This has not yet been tested */
// export function discardTopCardsFromDeck(properties: { amount: number; }): ICost {
//     return {
//         getActionName: (context) => 'discardTopCardsFromDeck',
//         getCostMessage: (context) => ['discarding {0}'],
//         canPay: (context) => context.player.deck.size() >= 4,
//         resolve: (context) => {
//             context.costs.discardTopCardsFromDeck = context.player.deck.first(4);
//         },
//         pay: (context) => {
//             for (const card of context.costs.discardTopCardsFromDeck as Card[]) {
//                 card.controller.moveCard(card, Location.Deck);
//             }
//         }
//     };
// }

// /**
//  * Cost that requires removing a card selected by the player from the game.
//  */
// export function removeFromGame(properties: SelectCostProperties): Cost {
//     return getSelectCost(GameSystems.removeFromGame(), properties, 'Select card to remove from game');
// }

// /**
//  * Cost that requires removing a card selected by the player from the game.
//  */
// export function removeSelfFromGame(properties?: { location: Array<Location> }): Cost {
//     return new GameSystemCost(GameSystems.removeFromGame(properties));
// }

// export function discardStatusToken(properties: Omit<SelectCardProperties, 'gameSystem' | 'subActionProperties'>): Cost {
//     return new MetaActionCost(
//         GameSystems.selectCard(
//             Object.assign(
//                 {
//                     gameSystem: GameSystems.discardStatusToken(),
//                     subActionProperties: (card: BaseCard) => ({ target: card.getStatusToken(CharacterStatus.Honored) })
//                 },
//                 properties
//             )
//         ),
//         'Select character to discard honored status token from'
//     );
// }

// /**
//  * Cost that will discard the status token on a card to be selected by the player
//  */
// export function discardStatusTokenFromSelf(): Cost {
//     return new GameSystemCost(GameSystems.discardStatusToken());
// }

// /**
//  * Cost that will put into play the card that initiated the ability
//  */
// export function putSelfIntoPlay(): ICost {
//     return new GameSystemCost(GameSystems.putIntoPlay());
// }

// /**
//  * Cost that will prompt for a card
//  */
// export function selectedReveal(properties: SelectCostProperties): Cost {
//     return getSelectCost(GameSystems.reveal(), properties, `Select a ${properties.cardType || 'card'} to reveal`);
// }

// /**
//  * Cost that will reveal specific cards
//  */
// export function reveal(cardFunc: (context: AbilityContext) => BaseCard[]): Cost {
//     return new GameSystemCost(GameSystems.reveal((context) => ({ target: cardFunc(context) })));
// }

// /**
//  * Cost that will pay the exact printed fate cost for the card.
//  */
// export function payPrintedFateCost(): Cost {
//     return {
//         canIgnoreForTargeting: true,
//         canPay(context: TriggeredAbilityContext) {
//             const amount = context.source.cost;
//             return (
//                 context.player.fate >= amount &&
//                 (amount === 0 || !context.player.hasRestriction('spendFate', context))
//             );
//         },
//         payEvent(context: TriggeredAbilityContext) {
//             const amount = context.source.cost;
//             return new GameEvent(
//                 EventName.OnSpendFate,
//                 { amount, context },
//                 (event) => (event.context.player.fate -= event.amount)
//             );
//         }
//     };
// }

/**
 * Cost that will pay the printed cost on the card minus any active
 * adjuster effects the play has activated. Upon playing the card, all
 * matching adjuster effects will expire, if applicable.
 */
export function payPlayCardResourceCost<TContext extends AbilityContext = AbilityContext>(playType: PlayType, ignoreType = false): ICost<TContext> {
    return new PlayCardResourceCost<TContext>(playType, ignoreType);
}

// /**
//  * Cost that is dependent on context.targets[targetName]
//  */
// export function payTargetDependentFateCost(targetName: string, ignoreType = false): Cost {
//     return new TargetDependentFateCost(ignoreType, targetName);
// }

/**
 * Cost in which the player must pay a fixed, non-reduceable amount of fate.
 */
export function abilityResourceCost<TContext extends AbilityContext = AbilityContext>(amount: number | ((context: TContext) => number)): ICost<TContext> {
    return new GameSystemCost<TContext>(
        typeof amount === 'function'
            ? GameSystems.payResourceCost<TContext>((context) => ({ target: context.player, amount: amount(context) }))
            : GameSystems.payResourceCost<TContext>((context) => ({ target: context.player, amount }))
    );
}

// TODO: reuse variable methods for swu cards
// export function variableHonorCost(amountFunc: (context: TriggeredAbilityContext) => number): Cost {
//     return {
//         promptsPlayer: true,
//         canPay(context: TriggeredAbilityContext) {
//             return amountFunc(context) > 0 && context.game.actions.loseHonor().canAffect(context.player, context);
//         },
//         resolve(context: TriggeredAbilityContext, result) {
//             const amount = amountFunc(context);
//             const max = Math.min(amount, context.player.honor);
//             const choices = Array.from(Array(max), (x, i) => String(i + 1));
//             if (result.canCancel) {
//                 choices.push('Cancel');
//             }
//             context.game.promptWithHandlerMenu(context.player, {
//                 activePromptTitle: 'Choose how much honor to pay',
//                 context: context,
//                 choices: choices,
//                 choiceHandler: (choice) => {
//                     if (choice === 'Cancel') {
//                         context.costs.variableHonorCost = 0;
//                         result.cancelled = true;
//                     } else {
//                         context.costs.variableHonorCost = parseInt(choice);
//                     }
//                 }
//             });
//         },
//         payEvent(context: TriggeredAbilityContext) {
//             const action = context.game.actions.loseHonor({ amount: context.costs.variableHonorCost });
//             return action.generateEvent(context.player, context);
//         }
//     };
// }

// export function variableFateCost(properties: {
//     activePromptTitle: string;
//     minAmount?: Derivable<number, TriggeredAbilityContext>;
//     maxAmount: Derivable<number, TriggeredAbilityContext>;
// }): Cost {
//     function deriveMinAmount(context: TriggeredAbilityContext) {
//         return properties.minAmount === undefined ? 1 : derive(properties.minAmount, context);
//     }
//     function deriveMaxAmount(context: TriggeredAbilityContext) {
//         return properties.maxAmount === undefined ? -1 : derive(properties.maxAmount, context);
//     }
//     return {
//         promptsPlayer: true,
//         canPay(context: TriggeredAbilityContext) {
//             if ((context as any).ignoreResourceCost) {
//                 return true;
//             }
//             const costModifiers = context.player.getTotalCostModifiers(PlayType.PlayFromHand, context.source);
//             return (
//                 costModifiers < 0 ||
//                 (context.player.fate >= deriveMinAmount(context) + costModifiers &&
//                     context.game.actions.loseFate().canAffect(context.player, context))
//             );
//         },
//         resolve(context: TriggeredAbilityContext, result) {
//             const costModifiers = (context as any).ignoreResourceCost
//                 ? -1000
//                 : context.player.getTotalCostModifiers(PlayType.PlayFromHand, context.source);

//             const maxAmount = deriveMaxAmount(context);
//             const min = deriveMinAmount(context);
//             let max = context.player.fate - costModifiers;
//             if (maxAmount >= 0) {
//                 max = Math.min(maxAmount, context.player.fate - costModifiers);
//             }
//             if (!context.game.actions.loseFate().canAffect(context.player, context)) {
//                 max = Math.min(max, -costModifiers);
//             }
//             const choices = Array.from({ length: max + 1 - min }, (_, idx) => String(idx + min));
//             if (result.canCancel) {
//                 choices.push('Cancel');
//             }
//             context.game.promptWithHandlerMenu(context.player, {
//                 activePromptTitle: properties.activePromptTitle
//                     ? properties.activePromptTitle
//                     : 'Choose how much fate to pay',
//                 context: context,
//                 choices: choices,
//                 choiceHandler: (choice: string) => {
//                     if (choice === 'Cancel') {
//                         context.costs.variableFateCost = 0;
//                         result.cancelled = true;
//                     } else {
//                         context.costs.variableFateCost = Math.max(0, parseInt(choice));
//                     }
//                 }
//             });
//         },
//         payEvent(context: TriggeredAbilityContext) {
//             const payZeroFate = new HandlerAction({});
//             if ((context as any).ignoreResourceCost) {
//                 return payZeroFate.generateEvent(context.player, context);
//             }

//             const costModifiers = context.player.getTotalCostModifiers(PlayType.PlayFromHand, context.source);
//             const cost = context.costs.variableFateCost + Math.min(0, costModifiers); //+ve cost modifiers are applied by the engine
//             if (cost > 0) {
//                 const action = context.game.actions.loseFate({ amount: cost });
//                 return action.generateEvent(context.player, context);
//             }

//             return payZeroFate.generateEvent(context.player, context);
//         }
//     };
// }

// export function discardCardsExactlyVariableX(amountDerivable: Derivable<number, TriggeredAbilityContext>): Cost {
//     return {
//         promptsPlayer: true,
//         canPay(context: TriggeredAbilityContext) {
//             return (
//                 derive(amountDerivable, context) > 0 &&
//                 context.game.actions.chosenDiscard().canAffect(context.player, context)
//             );
//         },
//         resolve(context: TriggeredAbilityContext, result) {
//             const amount = derive(amountDerivable, context);
//             context.game.promptForSelect(context.player, {
//                 activePromptTitle: 'Choose ' + amount + ' card' + (amount === 1 ? '' : 's') + ' to discard',
//                 context: context,
//                 mode: TargetMode.Exactly,
//                 numCards: amount,
//                 ordered: false,
//                 location: Location.Hand,
//                 controller: RelativePlayer.Self,
//                 onSelect: (player, cards) => {
//                     if (cards.length === 0) {
//                         context.costs.discardCardsExactlyVariableX = [];
//                         result.cancelled = true;
//                     } else {
//                         context.costs.discardCardsExactlyVariableX = cards;
//                     }
//                     return true;
//                 },
//                 onCancel: () => {
//                     result.cancelled = true;
//                     return true;
//                 }
//             });
//         },
//         payEvent(context: TriggeredAbilityContext) {
//             const action = context.game.actions.discardCard({ target: context.costs.discardCardsExactlyVariableX });
//             return action.generateEvent(context.costs.discardCardsExactlyVariableX, context);
//         }
//     };
// }

// export function discardHand(): Cost {
//     return {
//         promptsPlayer: true,
//         canPay(context: TriggeredAbilityContext) {
//             return context.game.actions.chosenDiscard().canAffect(context.player, context);
//         },
//         resolve(context: TriggeredAbilityContext, result) {
//             context.costs.discardHand = context.player.hand.value();
//         },
//         payEvent(context: TriggeredAbilityContext) {
//             const action = context.game.actions.discardCard({ target: context.costs.discardHand });
//             return action.generateEvent(context.costs.discardHand, context);
//         }
//     };
// }

// export function optional(cost: ICost): ICost {
//     const getActionName = (context: TriggeredAbilityContext) =>
//         `optional${cost.getActionName(context).replace(/^./, (c) => c.toUpperCase())}`;

//     return {
//         promptsPlayer: true,
//         canPay: () => true,
//         getCostMessage: (context: TriggeredAbilityContext) =>
//             (context.costs[getActionName(context)] ? cost.getCostMessage(context) : undefined),
//         getActionName: getActionName,
//         resolve: (context: TriggeredAbilityContext, result) => {
//             if (!cost.canPay(context)) {
//                 return;
//             }
//             const actionName = getActionName(context);

//             const choices = ['Yes', 'No'];
//             const handlers = [
//                 () => {
//                     context.costs[actionName] = true;
//                 },
//                 // eslint-disable-next-line @typescript-eslint/no-empty-function
//                 () => {}
//             ];

//             if (result.canCancel) {
//                 choices.push('Cancel');
//                 handlers.push(() => {
//                     result.cancelled = true;
//                 });
//             }

//             context.game.promptWithHandlerMenu(context.player, {
//                 activePromptTitle: 'Pay optional cost?',
//                 source: context.source,
//                 choices: choices,
//                 handlers: handlers
//             });
//         },

//         payEvent: (context: TriggeredAbilityContext) => {
//             const actionName = getActionName(context);
//             if (!context.costs[actionName]) {
//                 const doNothing = new ExecuteHandlerSystem({});
//                 return doNothing.generateEvent(context.player, context);
//             }

//             return cost.queueGenerateEventGameSteps(context, {});
//         }
//     };
// }

// export function optionalFateCost(amount: number): Cost {
//     return {
//         promptsPlayer: true,
//         canPay() {
//             return true;
//         },
//         getActionName(context: TriggeredAbilityContext) {
//             return 'optionalFateCost';
//         },
//         getCostMessage: (context: TriggeredAbilityContext) => {
//             if (context.costs.optionalFateCost === 0) {
//                 return undefined;
//             }
//             return ['paying {1} fate', [amount]];
//         },
//         resolve(context: TriggeredAbilityContext, result) {
//             let fateAvailable = true;
//             if (context.player.fate < amount) {
//                 fateAvailable = false;
//             }
//             if (context.player.hasRestriction('spendFate', context)) {
//                 fateAvailable = false;
//             }
//             let choices = [];
//             let handlers = [];
//             context.costs.optionalFateCost = 0;

//             if (fateAvailable) {
//                 choices = ['Yes', 'No'];
//                 handlers = [
//                     () => (context.costs.optionalFateCost = amount),
//                     () => (context.costs.optionalFateCost = 0)
//                 ];
//             }
//             if (fateAvailable && result.canCancel) {
//                 choices.push('Cancel');
//                 handlers.push(() => {
//                     result.cancelled = true;
//                 });
//             }

//             if (choices.length > 0) {
//                 context.game.promptWithHandlerMenu(context.player, {
//                     activePromptTitle: 'Spend ' + amount + ' fate?',
//                     source: context.source,
//                     choices: choices,
//                     handlers: handlers
//                 });
//             }
//         },
//         pay(context: TriggeredAbilityContext) {
//             context.player.fate -= context.costs.optionalFateCost;
//         }
//     };
// }

// export function nameCard(): ICost {
//     return {
//         selectCardName(player, cardName, context) {
//             context.costs.nameCardCost = cardName;
//             return true;
//         },
//         getActionName(context: TriggeredAbilityContext) {
//             return 'nameCard';
//         },
//         getCostMessage(context: TriggeredAbilityContext) {
//             return ['naming {1}', [context.costs.nameCardCost]];
//         },
//         canPay() {
//             return true;
//         },
//         resolve(context: TriggeredAbilityContext) {
//             const dummyObject = {
//                 selectCardName: (player, cardName, context) => {
//                     context.costs.nameCardCost = cardName;
//                     return true;
//                 }
//             };

//             context.game.promptWithMenu(context.player, dummyObject, {
//                 context: context,
//                 activePrompt: {
//                     menuTitle: 'Name a card',
//                     controls: [
//                         { type: 'card-name', command: 'menuButton', method: 'selectCardName', name: 'card-name' }
//                     ]
//                 }
//             });
//         },
//         // eslint-disable-next-line @typescript-eslint/no-empty-function
//         pay() {}
//     };
// }

// export function switchLocation(): Cost {
//     return {
//         promptsPlayer: false,
//         canPay(context: TriggeredAbilityContext) {
//             const canMoveHome = context.game.actions.sendHome().canAffect(context.source, context);
//             const canMoveToConflict = context.game.actions.moveToConflict().canAffect(context.source, context);

//             return canMoveHome || canMoveToConflict;
//         },
//         getActionName(context: TriggeredAbilityContext) {
//             return 'switchLocation';
//         },
//         getCostMessage(context: TriggeredAbilityContext) {
//             if (!context.source.isParticipating()) {
//                 return ['moving {1} home', [context.source]];
//             }
//             return ['moving {1} to the conflict', [context.source]];
//         },
//         resolve(context: TriggeredAbilityContext, result) {
//             context.costs.switchLocation = context.source;
//         },
//         payEvent(context: TriggeredAbilityContext) {
//             const action = context.source.isParticipating()
//                 ? context.game.actions.sendHome({ target: context.costs.switchLocation })
//                 : context.game.actions.moveToConflict({ target: context.costs.switchLocation });
//             return action.generateEvent(context.costs.switchLocation, context);
//         }
//     };
// }
