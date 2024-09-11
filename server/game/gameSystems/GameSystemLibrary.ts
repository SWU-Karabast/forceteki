import { GameSystem } from '../core/gameSystem/GameSystem';
import { AbilityContext } from '../core/ability/AbilityContext';

// import { AddTokenAction, AddTokenProperties } from './AddTokenAction';
import { AttachUpgradeSystem, IAttachUpgradeProperties } from './AttachUpgradeSystem';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import { DamageSystem, IDamageProperties } from './DamageSystem';
import { DeployLeaderSystem, IDeployLeaderProperties } from './DeployLeaderSystem';
import { DefeatCardSystem, IDefeatCardProperties } from './DefeatCardSystem';
// import { CardMenuAction, CardMenuProperties } from './CardMenuAction';
// import { ChooseActionProperties, ChooseGameAction } from './ChooseGameAction';
// import { ChosenDiscardAction, ChosenDiscardProperties } from './ChosenDiscardAction';
// import { ChosenReturnToDeckAction, ChosenReturnToDeckProperties } from './ChosenReturnToDeckAction';
import { ConditionalSystem, IConditionalSystemProperties } from './ConditionalSystem';
// import { CreateTokenAction, CreateTokenProperties } from './CreateTokenAction';
import { SearchDeckSystem, ISearchDeckProperties } from './SearchDeckSystem';
// import { DetachAction, DetachActionProperties } from './DetachAction';
// import { DiscardCardAction, DiscardCardProperties } from './DiscardCardAction';
// import { DiscardFromPlayAction, DiscardFromPlayProperties } from './DiscardFromPlayAction';
// import { DiscardStatusAction, DiscardStatusProperties } from './DiscardStatusAction';
import { DrawSystem, IDrawProperties } from './DrawSystem';
import { DrawSpecificCardSystem, IDrawSpecificCardProperties } from './DrawSpecificCardSystem';
import { ExhaustSystem, IExhaustSystemProperties } from './ExhaustSystem';
// import { GainStatusTokenAction, GainStatusTokenProperties } from './GainStatusTokenAction';
import { ExecuteHandlerSystem, IExecuteHandlerSystemProperties } from './ExecuteHandlerSystem';
// import { IfAbleAction, IfAbleActionProperties } from './IfAbleAction';
import { GiveExperienceSystem, IGiveExperienceProperties } from './GiveExperienceSystem';
import { GiveShieldSystem, IGiveShieldProperties } from './GiveShieldSystem';
import { HealSystem, IHealProperties } from './HealSystem';
import { InitiateAttackSystem, IInitiateAttackProperties } from './InitiateAttackSystem';
// import { JointGameAction } from './JointGameAction';
// import { LastingEffectAction, LastingEffectProperties } from './LastingEffectAction';
// import { LastingEffectCardAction, LastingEffectCardProperties } from './LastingEffectCardAction';
// import { LastingEffectRingAction, LastingEffectRingProperties } from './LastingEffectRingAction';
import { LookAtSystem, ILookAtProperties } from './LookAtSystem';
// import { MatchingDiscardAction, MatchingDiscardProperties } from './MatchingDiscardAction';
// import { MenuPromptAction, MenuPromptProperties } from './MenuPromptAction';
import { MoveCardSystem, IMoveCardProperties } from './MoveCardSystem';
// import { MoveTokenAction, MoveTokenProperties } from './MoveTokenAction';
// import { MultipleContextActionProperties, MultipleContextGameAction } from './MultipleContextGameAction';
// import { MultipleGameAction } from './MultipleGameAction';
// import { OpponentPutIntoPlayAction, OpponentPutIntoPlayProperties } from './OpponentPutIntoPlayAction';
// import { PlaceCardUnderneathAction, PlaceCardUnderneathProperties } from './PlaceCardUnderneathAction';
// import { PlayCardAction, PlayCardProperties } from './PlayCardAction';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import { PutIntoPlaySystem, IPutIntoPlayProperties } from './PutIntoPlaySystem';
import { ReadySystem, IReadySystemProperties } from './ReadySystem';
// import { RemoveFromGameAction, RemoveFromGameProperties } from './RemoveFromGameAction';
import { ReplacementEffectSystem, IReplacementEffectSystemProperties } from './ReplacementEffectSystem';
// import { ResolveAbilityAction, ResolveAbilityProperties } from './ResolveAbilityAction';
// import { ReturnToDeckSystem, IReturnToDeckProperties } from './ReturnToDeckSystem';
import { ReturnToHandSystem, IReturnToHandProperties } from './ReturnToHandSystem';
import { ReturnToHandFromPlaySystem, IReturnToHandFromPlayProperties } from './ReturnToHandFromPlaySystem';
import { RevealSystem, IRevealProperties } from './RevealSystem';
import { PayResourceCostSystem, IPayResourceCostProperties } from './PayResourceCostSystem';
import { SelectCardSystem, ISelectCardProperties } from './SelectCardSystem';
// import { SelectTokenAction, SelectTokenProperties } from './SelectTokenAction';
// import { SequentialContextAction, SequentialContextProperties } from './SequentialContextAction';
import { ShuffleDeckSystem, IShuffleDeckProperties } from './ShuffleDeckSystem';
// import { TakeControlAction, TakeControlProperties } from './TakeControlAction';
// import { TriggerAbilityAction, TriggerAbilityProperties } from './TriggerAbilityAction';
// import { TurnCardFacedownAction, TurnCardFacedownProperties } from './TurnCardFacedownAction';

type PropsFactory<Props> = Props | ((context: AbilityContext) => Props);

// allow block comments without spaces so we can have compact jsdoc descriptions in this file
/* eslint @stylistic/js/lines-around-comment: off */

//////////////
// CARD
//////////////
// export function addToken(propertyFactory: PropsFactory<AddTokenProperties> = {}): GameSystem {
//     return new AddTokenAction(propertyFactory);
// }
export function attachUpgrade(propertyFactory: PropsFactory<IAttachUpgradeProperties> = {}): GameSystem {
    return new AttachUpgradeSystem(propertyFactory);
}
export function attack(propertyFactory: PropsFactory<IInitiateAttackProperties> = {}): CardTargetSystem {
    return new InitiateAttackSystem(propertyFactory);
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
export function deploy(propertyFactory: PropsFactory<IDeployLeaderProperties> = {}): CardTargetSystem {
    return new DeployLeaderSystem(propertyFactory);
}
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
export function giveExperience(propertyFactory: PropsFactory<IGiveExperienceProperties> = {}): CardTargetSystem {
    return new GiveExperienceSystem(propertyFactory);
}
export function giveShield(propertyFactory: PropsFactory<IGiveShieldProperties> = {}): CardTargetSystem {
    return new GiveShieldSystem(propertyFactory);
}
export function heal(propertyFactory: PropsFactory<IHealProperties>): GameSystem {
    return new HealSystem(propertyFactory);
}
export function lookAt(propertyFactory: PropsFactory<ILookAtProperties> = {}): GameSystem {
    return new LookAtSystem(propertyFactory);
}

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
export function payResourceCost(propertyFactory: PropsFactory<IPayResourceCostProperties>): GameSystem {
    return new PayResourceCostSystem(propertyFactory);
}
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
export function ready(propertyFactory: PropsFactory<IReadySystemProperties> = {}): GameSystem {
    return new ReadySystem(propertyFactory);
}
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
/**
 * default chatMessage = false
 */
export function reveal(propertyFactory: PropsFactory<IRevealProperties> = {}): CardTargetSystem {
    return new RevealSystem(propertyFactory);
}
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

/**
 * default cardsToSearch = -1 (whole deck)
 * default selectCardCount = 1 (number of cards to retrieve)
 * default targetMode = TargetMode.UpTo (retrieve 0 up to the selectCardCount)
 * default shuffle = false (set to true if deck should be shuffled after search)
 * default reveal = true (set to false if the cards chosen should not be revealed)
 * default placeOnBottomInRandomOrder = true (place unchosen cards on the bottom of the deck in random order)
 * default cardCondition = always true
 */
export function deckSearch(propertyFactory: PropsFactory<ISearchDeckProperties>): GameSystem {
    return new SearchDeckSystem(propertyFactory);
}

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
/**
 * default amount = 1
 */
export function draw(propertyFactory: PropsFactory<IDrawProperties> = {}): GameSystem {
    return new DrawSystem(propertyFactory);
}

/**
 * default amount = 1
 */
export function drawSpecificCard(propertyFactory: PropsFactory<IDrawSpecificCardProperties> = {}): CardTargetSystem {
    return new DrawSpecificCardSystem(propertyFactory);
}
// export function playerLastingEffect(propertyFactory: PropsFactory<LastingEffectProperties>): GameSystem {
//     return new LastingEffectAction(propertyFactory);
// } // duration = 'untilEndOfConflict', effect, targetController, condition, until

// //////////////
// // GENERIC
// //////////////
export function handler(propertyFactory: PropsFactory<IExecuteHandlerSystemProperties>): GameSystem {
    return new ExecuteHandlerSystem(propertyFactory);
}
export function noAction(): GameSystem {
    return new ExecuteHandlerSystem({});
}
export function replacementEffect(propertyFactory: PropsFactory<IReplacementEffectSystemProperties>): GameSystem {
    return new ReplacementEffectSystem(propertyFactory);
}

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
//     return new SequentialSystem(gameActions);
// } // takes an array of gameActions, not a propertyFactory
// export function sequentialContext(propertyFactory: PropsFactory<SequentialContextProperties>): GameSystem {
//     return new SequentialContextAction(propertyFactory);
// }

export function shuffleDeck(propertyFactory: PropsFactory<IShuffleDeckProperties> = {}): PlayerTargetSystem {
    return new ShuffleDeckSystem(propertyFactory);
}