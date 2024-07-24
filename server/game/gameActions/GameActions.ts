import { AbilityContext } from '../AbilityContext';
// import { AddTokenAction, AddTokenProperties } from './AddTokenAction';
// import { AttachAction, AttachActionProperties } from './AttachAction';
// import { BowAction, BowActionProperties } from './BowAction';
// import { CancelAction, CancelActionProperties } from './CancelAction';
import { CardGameAction } from './CardGameAction';
// import { CardMenuAction, CardMenuProperties } from './CardMenuAction';
// import { ChooseActionProperties, ChooseGameAction } from './ChooseGameAction';
// import { ChosenDiscardAction, ChosenDiscardProperties } from './ChosenDiscardAction';
// import { ChosenReturnToDeckAction, ChosenReturnToDeckProperties } from './ChosenReturnToDeckAction';
// import { ConditionalAction, ConditionalActionProperties } from './ConditionalAction';
// import { CreateTokenAction, CreateTokenProperties } from './CreateTokenAction';
// import { DeckSearchAction, DeckSearchProperties } from './DeckSearchAction';
// import { DetachAction, DetachActionProperties } from './DetachAction';
// import { DiscardCardAction, DiscardCardProperties } from './DiscardCardAction';
// import { DiscardFromPlayAction, DiscardFromPlayProperties } from './DiscardFromPlayAction';
// import { DiscardStatusAction, DiscardStatusProperties } from './DiscardStatusAction';
// import { DrawAction, DrawProperties } from './DrawAction';
// import { GainStatusTokenAction, GainStatusTokenProperties } from './GainStatusTokenAction';
import { GameAction } from './GameAction';
import { HandlerAction, HandlerProperties } from './HandlerAction';
// import { IfAbleAction, IfAbleActionProperties } from './IfAbleAction';
// import { JointGameAction } from './JointGameAction';
// import { LastingEffectAction, LastingEffectProperties } from './LastingEffectAction';
// import { LastingEffectCardAction, LastingEffectCardProperties } from './LastingEffectCardAction';
// import { LastingEffectRingAction, LastingEffectRingProperties } from './LastingEffectRingAction';
// import { LookAtAction, LookAtProperties } from './LookAtAction';
// import { MatchingDiscardAction, MatchingDiscardProperties } from './MatchingDiscardAction';
// import { MenuPromptAction, MenuPromptProperties } from './MenuPromptAction';
import { MoveCardAction, MoveCardProperties } from './MoveCardAction';
// import { MoveTokenAction, MoveTokenProperties } from './MoveTokenAction';
// import { MultipleContextActionProperties, MultipleContextGameAction } from './MultipleContextGameAction';
// import { MultipleGameAction } from './MultipleGameAction';
// import { OpponentPutIntoPlayAction, OpponentPutIntoPlayProperties } from './OpponentPutIntoPlayAction';
// import { PlaceCardUnderneathAction, PlaceCardUnderneathProperties } from './PlaceCardUnderneathAction';
// import { PlayCardAction, PlayCardProperties } from './PlayCardAction';
import { PutIntoPlayAction, PutIntoPlayProperties } from './PutIntoPlayAction';
import { RandomDiscardAction, RandomDiscardProperties } from './RandomDiscardAction';
// import { ReadyAction, ReadyProperties } from './ReadyAction';
// import { RemoveFromGameAction, RemoveFromGameProperties } from './RemoveFromGameAction';
// import { ResolveAbilityAction, ResolveAbilityProperties } from './ResolveAbilityAction';
import { ReturnToDeckAction, ReturnToDeckProperties } from './ReturnToDeckAction';
// import { ReturnToHandAction, ReturnToHandProperties } from './ReturnToHandAction';
// import { RevealAction, RevealProperties } from './RevealAction';
import { SelectCardAction, SelectCardProperties } from './SelectCardAction';
// import { SelectTokenAction, SelectTokenProperties } from './SelectTokenAction';
// import { SequentialAction } from './SequentialAction';
// import { SequentialContextAction, SequentialContextProperties } from './SequentialContextAction';
// import { ShuffleDeckAction, ShuffleDeckProperties } from './ShuffleDeckAction';
// import { TakeControlAction, TakeControlProperties } from './TakeControlAction';
// import { TriggerAbilityAction, TriggerAbilityProperties } from './TriggerAbilityAction';
// import { TurnCardFacedownAction, TurnCardFacedownProperties } from './TurnCardFacedownAction';

type PropsFactory<Props> = Props | ((context: AbilityContext) => Props);

//////////////
// CARD
//////////////
// export function addToken(propertyFactory: PropsFactory<AddTokenProperties> = {}): GameAction {
//     return new AddTokenAction(propertyFactory);
// }
// export function attach(propertyFactory: PropsFactory<AttachActionProperties> = {}): GameAction {
//     return new AttachAction(propertyFactory);
// }
// export function bow(propertyFactory: PropsFactory<BowActionProperties> = {}): CardGameAction {
//     return new BowAction(propertyFactory);
// }
// export function cardLastingEffect(propertyFactory: PropsFactory<LastingEffectCardProperties>): GameAction {
//     return new LastingEffectCardAction(propertyFactory);
// }
// export function createToken(propertyFactory: PropsFactory<CreateTokenProperties> = {}): GameAction {
//     return new CreateTokenAction(propertyFactory);
// }
// export function detach(propertyFactory: PropsFactory<DetachActionProperties> = {}): GameAction {
//     return new DetachAction(propertyFactory);
// }
// export function discardCard(propertyFactory: PropsFactory<DiscardCardProperties> = {}): CardGameAction {
//     return new DiscardCardAction(propertyFactory);
// }
// export function discardFromPlay(propertyFactory: PropsFactory<DiscardFromPlayProperties> = {}): GameAction {
//     return new DiscardFromPlayAction(propertyFactory);
// }
// export function lookAt(propertyFactory: PropsFactory<LookAtProperties> = {}): GameAction {
//     return new LookAtAction(propertyFactory);
// }
/**
 * default switch = false
 * default shuffle = false
 * default faceup = false
 */
export function moveCard(propertyFactory: PropsFactory<MoveCardProperties>): CardGameAction {
    return new MoveCardAction(propertyFactory);
}
// /**
//  * default resetOnCancel = false
//  */
// export function playCard(propertyFactory: PropsFactory<PlayCardProperties> = {}): GameAction {
//     return new PlayCardAction(propertyFactory);
// }
/**
 * default fate = 0
 * default status = ordinary
 */
export function putIntoPlay(propertyFactory: PropsFactory<PutIntoPlayProperties> = {}): GameAction {
    return new PutIntoPlayAction(propertyFactory);
}
// /**
//  * default fate = 0
//  * default status = ordinary
//  */
// export function opponentPutIntoPlay(propertyFactory: PropsFactory<OpponentPutIntoPlayProperties> = {}): GameAction {
//     return new OpponentPutIntoPlayAction(propertyFactory, false);
// }
// export function ready(propertyFactory: PropsFactory<ReadyProperties> = {}): GameAction {
//     return new ReadyAction(propertyFactory);
// }
// export function removeFromGame(propertyFactory: PropsFactory<RemoveFromGameProperties> = {}): CardGameAction {
//     return new RemoveFromGameAction(propertyFactory);
// }
// export function resolveAbility(propertyFactory: PropsFactory<ResolveAbilityProperties>): GameAction {
//     return new ResolveAbilityAction(propertyFactory);
// }
// /**
//  * default bottom = false
//  */
// export function returnToDeck(propertyFactory: PropsFactory<ReturnToDeckProperties> = {}): CardGameAction {
//     return new ReturnToDeckAction(propertyFactory);
// }
// export function returnToHand(propertyFactory: PropsFactory<ReturnToHandProperties> = {}): CardGameAction {
//     return new ReturnToHandAction(propertyFactory);
// }
// /**
//  * default chatMessage = false
//  */
// export function reveal(propertyFactory: PropsFactory<RevealProperties> = {}): CardGameAction {
//     return new RevealAction(propertyFactory);
// }
// export function sacrifice(propertyFactory: PropsFactory<DiscardFromPlayProperties> = {}): CardGameAction {
//     return new DiscardFromPlayAction(propertyFactory, true);
// }
// export function takeControl(propertyFactory: PropsFactory<TakeControlProperties> = {}): GameAction {
//     return new TakeControlAction(propertyFactory);
// }
// export function triggerAbility(propertyFactory: PropsFactory<TriggerAbilityProperties>): GameAction {
//     return new TriggerAbilityAction(propertyFactory);
// }
// export function turnFacedown(propertyFactory: PropsFactory<TurnCardFacedownProperties> = {}): GameAction {
//     return new TurnCardFacedownAction(propertyFactory);
// }
// export function gainStatusToken(propertyFactory: PropsFactory<GainStatusTokenProperties> = {}): GameAction {
//     return new GainStatusTokenAction(propertyFactory);
// }
// /**
//  * default hideWhenFaceup = true
//  */
// export function placeCardUnderneath(propertyFactory: PropsFactory<PlaceCardUnderneathProperties>): GameAction {
//     return new PlaceCardUnderneathAction(propertyFactory);
// }

// //////////////
// // PLAYER
// //////////////
// /**
//  * default amount = 1
//  */
// export function chosenDiscard(propertyFactory: PropsFactory<ChosenDiscardProperties> = {}): GameAction {
//     return new ChosenDiscardAction(propertyFactory);
// }
// /**
//  * default amount = 1
//  */
// export function chosenReturnToDeck(propertyFactory: PropsFactory<ChosenReturnToDeckProperties> = {}): GameAction {
//     return new ChosenReturnToDeckAction(propertyFactory);
// }
// /**
//  * default amount = -1 (whole deck)
//  * default reveal = true
//  * default cardCondition = always true
//  */
// export function deckSearch(propertyFactory: PropsFactory<DeckSearchProperties>): GameAction {
//     return new DeckSearchAction(propertyFactory);
// }
/**
 * default amount = 1
 */
export function discardAtRandom(propertyFactory: PropsFactory<RandomDiscardProperties> = {}): GameAction {
    return new RandomDiscardAction(propertyFactory);
}
// /**
//  * default amount = 1
//  */
// export function discardMatching(propertyFactory: PropsFactory<MatchingDiscardProperties> = {}): GameAction {
//     return new MatchingDiscardAction(propertyFactory);
// }
// /**
//  * default amount = 1
//  */
// export function draw(propertyFactory: PropsFactory<DrawProperties> = {}): GameAction {
//     return new DrawAction(propertyFactory);
// }
// export function playerLastingEffect(propertyFactory: PropsFactory<LastingEffectProperties>): GameAction {
//     return new LastingEffectAction(propertyFactory);
// } // duration = 'untilEndOfConflict', effect, targetController, condition, until

// //////////////
// // RING
// //////////////
// export function ringLastingEffect(propertyFactory: PropsFactory<LastingEffectRingProperties>): GameAction {
//     return new LastingEffectRingAction(propertyFactory);
// } // duration = 'untilEndOfConflict', effect, condition, until

// //////////////
// // STATUS TOKEN
// //////////////
// export function discardStatusToken(propertyFactory: PropsFactory<DiscardStatusProperties> = {}): GameAction {
//     return new DiscardStatusAction(propertyFactory);
// }
// export function moveStatusToken(propertyFactory: PropsFactory<MoveTokenProperties>): GameAction {
//     return new MoveTokenAction(propertyFactory);
// }

// //////////////
// // GENERIC
// //////////////
// export function cancel(propertyFactory: PropsFactory<CancelActionProperties> = {}): GameAction {
//     return new CancelAction(propertyFactory);
// }
export function handler(propertyFactory: PropsFactory<HandlerProperties>): GameAction {
    return new HandlerAction(propertyFactory);
}
export function noAction(): GameAction {
    return new HandlerAction({});
}

//////////////
// CONFLICT
//////////////
// export function conflictLastingEffect(propertyFactory: PropsFactory<LastingEffectProperties>): GameAction {
//     return new LastingEffectAction(propertyFactory);
// } // duration = 'untilEndOfConflict', effect, targetController, condition, until
export function immediatelyResolveConflict(): GameAction {
    return new HandlerAction({});
}

// //////////////
// // META
// //////////////
// export function cardMenu(propertyFactory: PropsFactory<CardMenuProperties>): GameAction {
//     return new CardMenuAction(propertyFactory);
// }
// export function chooseAction(propertyFactory: PropsFactory<ChooseActionProperties>): GameAction {
//     return new ChooseGameAction(propertyFactory);
// } // choices, activePromptTitle = 'Select one'
// export function conditional(propertyFactory: PropsFactory<ConditionalActionProperties>): GameAction {
//     return new ConditionalAction(propertyFactory);
// }
// export function onAffinity(propertyFactory: PropsFactory<AffinityActionProperties>): GameAction {
//     return new AffinityAction(propertyFactory);
// }
// export function ifAble(propertyFactory: PropsFactory<IfAbleActionProperties>): GameAction {
//     return new IfAbleAction(propertyFactory);
// }
// export function joint(gameActions: GameAction[]): GameAction {
//     return new JointGameAction(gameActions);
// } // takes an array of gameActions, not a propertyFactory
// export function multiple(gameActions: GameAction[]): GameAction {
//     return new MultipleGameAction(gameActions);
// } // takes an array of gameActions, not a propertyFactory
// export function multipleContext(propertyFactory: PropsFactory<MultipleContextActionProperties>): GameAction {
//     return new MultipleContextGameAction(propertyFactory);
// }
// export function menuPrompt(propertyFactory: PropsFactory<MenuPromptProperties>): GameAction {
//     return new MenuPromptAction(propertyFactory);
// }
export function selectCard(propertyFactory: PropsFactory<SelectCardProperties>): GameAction {
    return new SelectCardAction(propertyFactory);
}
// export function selectToken(propertyFactory: PropsFactory<SelectTokenProperties>): GameAction {
//     return new SelectTokenAction(propertyFactory);
// }
// export function sequential(gameActions: GameAction[]): GameAction {
//     return new SequentialAction(gameActions);
// } // takes an array of gameActions, not a propertyFactory
// export function sequentialContext(propertyFactory: PropsFactory<SequentialContextProperties>): GameAction {
//     return new SequentialContextAction(propertyFactory);
// }
