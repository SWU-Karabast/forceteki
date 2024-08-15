import { GameSystem } from '../core/gameSystem/GameSystem';
import { AbilityContext } from '../core/ability/AbilityContext';

// import { AddTokenAction, AddTokenProperties } from './AddTokenAction';
// import { AttachAction, AttachActionProperties } from './AttachAction';
import { AttackSystem, IAttackProperties } from './AttackSystem';
// import { CancelAction, CancelActionProperties } from './CancelAction';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import { DamageSystem, IDamageProperties } from './DamageSystem';
import { DefeatCardSystem, IDefeatCardProperties } from './DefeatCardSystem';
// import { CardMenuAction, CardMenuProperties } from './CardMenuAction';
// import { ChooseActionProperties, ChooseGameAction } from './ChooseGameAction';
// import { ChosenDiscardAction, ChosenDiscardProperties } from './ChosenDiscardAction';
// import { ChosenReturnToDeckAction, ChosenReturnToDeckProperties } from './ChosenReturnToDeckAction';
import { ConditionalSystem, IConditionalSystemProperties } from './ConditionalSystem';
// import { CreateTokenAction, CreateTokenProperties } from './CreateTokenAction';
// import { DeckSearchAction, DeckSearchProperties } from './DeckSearchAction';
// import { DetachAction, DetachActionProperties } from './DetachAction';
// import { DiscardCardAction, DiscardCardProperties } from './DiscardCardAction';
// import { DiscardFromPlayAction, DiscardFromPlayProperties } from './DiscardFromPlayAction';
// import { DiscardStatusAction, DiscardStatusProperties } from './DiscardStatusAction';
// import { DrawAction, DrawProperties } from './DrawAction';
import { ExhaustSystem, IExhaustSystemProperties } from './ExhaustSystem';
// import { GainStatusTokenAction, GainStatusTokenProperties } from './GainStatusTokenAction';
import { ExecuteHandlerSystem, IExecuteHandlerSystemProperties } from './ExecuteHandlerSystem';
// import { IfAbleAction, IfAbleActionProperties } from './IfAbleAction';
import { HealSystem, IHealProperties } from './HealSystem';
// import { JointGameAction } from './JointGameAction';
// import { LastingEffectAction, LastingEffectProperties } from './LastingEffectAction';
// import { LastingEffectCardAction, LastingEffectCardProperties } from './LastingEffectCardAction';
// import { LastingEffectRingAction, LastingEffectRingProperties } from './LastingEffectRingAction';
// import { LookAtAction, LookAtProperties } from './LookAtAction';
// import { MatchingDiscardAction, MatchingDiscardProperties } from './MatchingDiscardAction';
// import { MenuPromptAction, MenuPromptProperties } from './MenuPromptAction';
import { MoveCardSystem, IMoveCardProperties } from './MoveCardSystem';
// import { MoveTokenAction, MoveTokenProperties } from './MoveTokenAction';
// import { MultipleContextActionProperties, MultipleContextGameAction } from './MultipleContextGameAction';
// import { MultipleGameAction } from './MultipleGameAction';
// import { OpponentPutIntoPlayAction, OpponentPutIntoPlayProperties } from './OpponentPutIntoPlayAction';
// import { PlaceCardUnderneathAction, PlaceCardUnderneathProperties } from './PlaceCardUnderneathAction';
// import { PlayCardAction, PlayCardProperties } from './PlayCardAction';
import { PutIntoPlaySystem, IPutIntoPlayProperties } from './PutIntoPlaySystem';
// import { ReadyAction, ReadyProperties } from './ReadyAction';
// import { RemoveFromGameAction, RemoveFromGameProperties } from './RemoveFromGameAction';
// import { ResolveAbilityAction, ResolveAbilityProperties } from './ResolveAbilityAction';
// import { ReturnToDeckSystem, IReturnToDeckProperties } from './ReturnToDeckSystem';
import { ReturnToHandSystem, IReturnToHandProperties } from './ReturnToHandSystem';
import { ReturnToHandFromPlaySystem, IReturnToHandFromPlayProperties } from './ReturnToHandFromPlaySystem';
// import { RevealAction, RevealProperties } from './RevealAction';
import { SelectCardSystem, ISelectCardProperties } from './SelectCardSystem';
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
// export function addToken(propertyFactory: PropsFactory<AddTokenProperties> = {}): GameSystem {
//     return new AddTokenAction(propertyFactory);
// }
// export function attach(propertyFactory: PropsFactory<AttachActionProperties> = {}): GameSystem {
//     return new AttachAction(propertyFactory);
// }
export function attack(propertyFactory: PropsFactory<IAttackProperties>): GameSystem {
    return new AttackSystem(propertyFactory);
}
// export function cardLastingEffect(propertyFactory: PropsFactory<LastingEffectCardProperties>): GameSystem {
//     return new LastingEffectCardAction(propertyFactory);
// }
// export function createToken(propertyFactory: PropsFactory<CreateTokenProperties> = {}): GameSystem {
//     return new CreateTokenAction(propertyFactory);
// }
export function damage(propertyFactory: PropsFactory<IDamageProperties>): GameSystem {
    return new DamageSystem(propertyFactory);
}
// export function detach(propertyFactory: PropsFactory<DetachActionProperties> = {}): GameSystem {
//     return new DetachAction(propertyFactory);
// }
export function defeat(propertyFactory: PropsFactory<IDefeatCardProperties> = {}): CardTargetSystem {
    return new DefeatCardSystem(propertyFactory);
}
// export function discardCard(propertyFactory: PropsFactory<DiscardCardProperties> = {}): CardGameAction {
//     return new DiscardCardAction(propertyFactory);
// }
// export function discardFromPlay(propertyFactory: PropsFactory<DiscardFromPlayProperties> = {}): GameSystem {
//     return new DiscardFromPlayAction(propertyFactory);
// }
export function exhaust(propertyFactory: PropsFactory<IExhaustSystemProperties> = {}): CardTargetSystem {
    return new ExhaustSystem(propertyFactory);
}
export function heal(propertyFactory: PropsFactory<IHealProperties>): GameSystem {
    return new HealSystem(propertyFactory);
}
// export function lookAt(propertyFactory: PropsFactory<LookAtProperties> = {}): GameSystem {
//     return new LookAtAction(propertyFactory);
// }
/**
 * default switch = false
 * default shuffle = false
 * default faceup = false
 */
export function moveCard(propertyFactory: PropsFactory<IMoveCardProperties>): CardTargetSystem {
    return new MoveCardSystem(propertyFactory);
}
// /**
//  * default resetOnCancel = false
//  */
// export function playCard(propertyFactory: PropsFactory<PlayCardProperties> = {}): GameSystem {
//     return new PlayCardAction(propertyFactory);
// }
/**
 * default status = ordinary
 */
export function putIntoPlay(propertyFactory: PropsFactory<IPutIntoPlayProperties> = {}): GameSystem {
    return new PutIntoPlaySystem(propertyFactory);
}
// /**
//  * default status = ordinary
//  */
// export function opponentPutIntoPlay(propertyFactory: PropsFactory<OpponentPutIntoPlayProperties> = {}): GameSystem {
//     return new OpponentPutIntoPlayAction(propertyFactory, false);
// }
// export function ready(propertyFactory: PropsFactory<ReadyProperties> = {}): GameSystem {
//     return new ReadyAction(propertyFactory);
// }
// export function removeFromGame(propertyFactory: PropsFactory<RemoveFromGameProperties> = {}): CardGameAction {
//     return new RemoveFromGameAction(propertyFactory);
// }
// export function resolveAbility(propertyFactory: PropsFactory<ResolveAbilityProperties>): GameSystem {
//     return new ResolveAbilityAction(propertyFactory);
// }
// /**
//  * default bottom = false
//  */
// export function returnToDeck(propertyFactory: PropsFactory<ReturnToDeckProperties> = {}): CardGameAction {
//     return new ReturnToDeckAction(propertyFactory);
// }
export function returnToHand(propertyFactory: PropsFactory<IReturnToHandProperties> = {}): CardTargetSystem {
    return new ReturnToHandSystem(propertyFactory);
}

export function returnToHandFromPlay(propertyFactory: PropsFactory<IReturnToHandFromPlayProperties> = {}): CardTargetSystem {
    return new ReturnToHandFromPlaySystem(propertyFactory);
}
// /**
//  * default chatMessage = false
//  */
// export function reveal(propertyFactory: PropsFactory<RevealProperties> = {}): CardGameAction {
//     return new RevealAction(propertyFactory);
// }
// export function sacrifice(propertyFactory: PropsFactory<DiscardFromPlayProperties> = {}): CardGameAction {
//     return new DiscardFromPlayAction(propertyFactory, true);
// }
// export function takeControl(propertyFactory: PropsFactory<TakeControlProperties> = {}): GameSystem {
//     return new TakeControlAction(propertyFactory);
// }
// export function triggerAbility(propertyFactory: PropsFactory<TriggerAbilityProperties>): GameSystem {
//     return new TriggerAbilityAction(propertyFactory);
// }
// export function turnFacedown(propertyFactory: PropsFactory<TurnCardFacedownProperties> = {}): GameSystem {
//     return new TurnCardFacedownAction(propertyFactory);
// }
// export function gainStatusToken(propertyFactory: PropsFactory<GainStatusTokenProperties> = {}): GameSystem {
//     return new GainStatusTokenAction(propertyFactory);
// }
// /**
//  * default hideWhenFaceup = true
//  */
// export function placeCardUnderneath(propertyFactory: PropsFactory<PlaceCardUnderneathProperties>): GameSystem {
//     return new PlaceCardUnderneathAction(propertyFactory);
// }

// //////////////
// // PLAYER
// //////////////
// /**
//  * default amount = 1
//  */
// export function chosenDiscard(propertyFactory: PropsFactory<ChosenDiscardProperties> = {}): GameSystem {
//     return new ChosenDiscardAction(propertyFactory);
// }
// /**
//  * default amount = 1
//  */
// export function chosenReturnToDeck(propertyFactory: PropsFactory<ChosenReturnToDeckProperties> = {}): GameSystem {
//     return new ChosenReturnToDeckAction(propertyFactory);
// }
// /**
//  * default amount = -1 (whole deck)
//  * default reveal = true
//  * default cardCondition = always true
//  */
// export function deckSearch(propertyFactory: PropsFactory<DeckSearchProperties>): GameSystem {
//     return new DeckSearchAction(propertyFactory);
// }
/**
 * default amount = 1
 */
// export function discardAtRandom(propertyFactory: PropsFactory<IRandomDiscardProperties> = {}): GameSystem {
//     return new RandomDiscardSystem(propertyFactory);
// }
// /**
//  * default amount = 1
//  */
// export function discardMatching(propertyFactory: PropsFactory<MatchingDiscardProperties> = {}): GameSystem {
//     return new MatchingDiscardAction(propertyFactory);
// }
// /**
//  * default amount = 1
//  */
// export function draw(propertyFactory: PropsFactory<DrawProperties> = {}): GameSystem {
//     return new DrawAction(propertyFactory);
// }
// export function playerLastingEffect(propertyFactory: PropsFactory<LastingEffectProperties>): GameSystem {
//     return new LastingEffectAction(propertyFactory);
// } // duration = 'untilEndOfConflict', effect, targetController, condition, until

// //////////////
// // RING
// //////////////
// export function ringLastingEffect(propertyFactory: PropsFactory<LastingEffectRingProperties>): GameSystem {
//     return new LastingEffectRingAction(propertyFactory);
// } // duration = 'untilEndOfConflict', effect, condition, until

// //////////////
// // STATUS TOKEN
// //////////////
// export function discardStatusToken(propertyFactory: PropsFactory<DiscardStatusProperties> = {}): GameSystem {
//     return new DiscardStatusAction(propertyFactory);
// }
// export function moveStatusToken(propertyFactory: PropsFactory<MoveTokenProperties>): GameSystem {
//     return new MoveTokenAction(propertyFactory);
// }

// //////////////
// // GENERIC
// //////////////
// export function cancel(propertyFactory: PropsFactory<CancelActionProperties> = {}): GameSystem {
//     return new CancelAction(propertyFactory);
// }
export function handler(propertyFactory: PropsFactory<IExecuteHandlerSystemProperties>): GameSystem {
    return new ExecuteHandlerSystem(propertyFactory);
}
export function noAction(): GameSystem {
    return new ExecuteHandlerSystem({});
}

//////////////
// CONFLICT
//////////////
// export function conflictLastingEffect(propertyFactory: PropsFactory<LastingEffectProperties>): GameSystem {
//     return new LastingEffectAction(propertyFactory);
// } // duration = 'untilEndOfConflict', effect, targetController, condition, until

// //////////////
// // META
// //////////////
// export function cardMenu(propertyFactory: PropsFactory<CardMenuProperties>): GameSystem {
//     return new CardMenuAction(propertyFactory);
// }
// export function chooseAction(propertyFactory: PropsFactory<ChooseActionProperties>): GameSystem {
//     return new ChooseGameAction(propertyFactory);
// } // choices, activePromptTitle = 'Select one'
export function conditional(propertyFactory: PropsFactory<IConditionalSystemProperties>): GameSystem {
    return new ConditionalSystem(propertyFactory);
}
// export function onAffinity(propertyFactory: PropsFactory<AffinityActionProperties>): GameSystem {
//     return new AffinityAction(propertyFactory);
// }
// export function ifAble(propertyFactory: PropsFactory<IfAbleActionProperties>): GameSystem {
//     return new IfAbleAction(propertyFactory);
// }
// export function joint(gameActions: GameSystem[]): GameSystem {
//     return new JointGameAction(gameActions);
// } // takes an array of gameActions, not a propertyFactory
// export function multiple(gameActions: GameSystem[]): GameSystem {
//     return new MultipleGameAction(gameActions);
// } // takes an array of gameActions, not a propertyFactory
// export function multipleContext(propertyFactory: PropsFactory<MultipleContextActionProperties>): GameSystem {
//     return new MultipleContextGameAction(propertyFactory);
// }
// export function menuPrompt(propertyFactory: PropsFactory<MenuPromptProperties>): GameSystem {
//     return new MenuPromptAction(propertyFactory);
// }
export function selectCard(propertyFactory: PropsFactory<ISelectCardProperties>): GameSystem {
    return new SelectCardSystem(propertyFactory);
}
// export function selectToken(propertyFactory: PropsFactory<SelectTokenProperties>): GameSystem {
//     return new SelectTokenAction(propertyFactory);
// }
// export function sequential(gameActions: GameSystem[]): GameSystem {
//     return new SequentialAction(gameActions);
// } // takes an array of gameActions, not a propertyFactory
// export function sequentialContext(propertyFactory: PropsFactory<SequentialContextProperties>): GameSystem {
//     return new SequentialContextAction(propertyFactory);
// }
