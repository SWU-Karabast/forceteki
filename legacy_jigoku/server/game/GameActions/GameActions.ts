import { AbilityContext } from '../AbilityContext';
import { AddTokenAction, AddTokenProperties } from './AddTokenAction';
import { AffinityAction, AffinityActionProperties } from './AffinityAction';
import { AttachAction, AttachActionProperties } from './AttachAction';
import { AttachToRingAction, AttachToRingActionProperties } from './AttachToRingAction';
import { BowAction, BowActionProperties } from './BowAction';
import { BreakAction, BreakProperties } from './BreakAction';
import { CancelAction, CancelActionProperties } from './CancelAction';
import { CardGameAction } from './CardGameAction';
import { CardMenuAction, CardMenuProperties } from './CardMenuAction';
import { ChooseActionProperties, ChooseGameAction } from './ChooseGameAction';
import { ChosenDiscardAction, ChosenDiscardProperties } from './ChosenDiscardAction';
import { ChosenReturnToDeckAction, ChosenReturnToDeckProperties } from './ChosenReturnToDeckAction';
import { ClaimFavorAction, ClaimFavorProperties } from './ClaimFavorAction';
import { ClaimRingAction, ClaimRingProperties } from './ClaimRingAction';
import { ConditionalAction, ConditionalActionProperties } from './ConditionalAction';
import { CreateTokenAction, CreateTokenProperties } from './CreateTokenAction';
import { DeckSearchAction, DeckSearchProperties } from './DeckSearchAction';
import { DetachAction, DetachActionProperties } from './DetachAction';
import { DiscardCardAction, DiscardCardProperties } from './DiscardCardAction';
import { DiscardFavorAction, DiscardFavorProperties } from './DiscardFavorAction';
import { DiscardFromPlayAction, DiscardFromPlayProperties } from './DiscardFromPlayAction';
import { DiscardStatusAction, DiscardStatusProperties } from './DiscardStatusAction';
import { DishonorAction, DishonorProperties } from './DishonorAction';
import { DishonorProvinceAction, DishonorProvinceProperties } from './DishonorProvinceAction';
import { DrawAction, DrawProperties } from './DrawAction';
import { DuelAction, DuelProperties } from './DuelAction';
import { DuelAddParticipantAction, DuelAddParticipantProperties } from './DuelAddParticipantAction';
import { FateBidAction, FateBidProperties } from './FateBidAction';
import { FillProvinceAction, FillProvinceProperties } from './FillProvinceAction';
import { FlipDynastyAction, FlipDynastyProperties } from './FlipDynastyAction';
import { FlipFavorAction, FlipFavorProperties } from './FlipFavorAction';
import { GainFateAction, GainFateProperties } from './GainFateAction';
import { GainHonorAction, GainHonorProperties } from './GainHonorAction';
import { GainStatusTokenAction, GainStatusTokenProperties } from './GainStatusTokenAction';
import { GameAction } from './GameAction';
import { GloryCountAction, GloryCountProperties } from './GloryCountAction';
import { HandlerAction, HandlerProperties } from './HandlerAction';
import { HonorAction, HonorProperties } from './HonorAction';
import { HonorBidAction, HonorBidProperties } from './HonorBidAction';
import { IfAbleAction, IfAbleActionProperties } from './IfAbleAction';
import { InitiateConflictAction, InitiateConflictProperties } from './InitiateConflictAction';
import { JointGameAction } from './JointGameAction';
import { LastingEffectAction, LastingEffectProperties } from './LastingEffectAction';
import { LastingEffectCardAction, LastingEffectCardProperties } from './LastingEffectCardAction';
import { LastingEffectRingAction, LastingEffectRingProperties } from './LastingEffectRingAction';
import { LookAtAction, LookAtProperties } from './LookAtAction';
import { LoseFateAction, LoseFateProperties } from './LoseFateAction';
import { LoseHonorAction, LoseHonorProperties } from './LoseHonorAction';
import { MatchingDiscardAction, MatchingDiscardProperties } from './MatchingDiscardAction';
import { MenuPromptAction, MenuPromptProperties } from './MenuPromptAction';
import { ModifyBidAction, ModifyBidProperties } from './ModifyBidAction';
import { MoveCardAction, MoveCardProperties } from './MoveCardAction';
import { MoveConflictAction, MoveConflictProperties } from './MoveConflictAction';
import { MoveToConflictAction, MoveToConflictProperties } from './MoveToConflictAction';
import { MoveTokenAction, MoveTokenProperties } from './MoveTokenAction';
import { MultipleContextActionProperties, MultipleContextGameAction } from './MultipleContextGameAction';
import { MultipleGameAction } from './MultipleGameAction';
import { OpponentPutIntoPlayAction, OpponentPutIntoPlayProperties } from './OpponentPutIntoPlayAction';
import { PlaceCardUnderneathAction, PlaceCardUnderneathProperties } from './PlaceCardUnderneathAction';
import { PlaceFateAction, PlaceFateProperties } from './PlaceFateAction';
import { PlaceFateAttachmentAction, PlaceFateAttachmentProperties } from './PlaceFateAttachmentAction';
import { PlaceFateRingAction, PlaceFateRingProperties } from './PlaceFateRingAction';
import { PlayCardAction, PlayCardProperties } from './PlayCardAction';
import { PutInProvinceAction, PutInProvinceProperties } from './PutInProvinceAction';
import { PutIntoPlayAction, PutIntoPlayProperties } from './PutIntoPlayAction';
import { RandomDiscardAction, RandomDiscardProperties } from './RandomDiscardAction';
import { ReadyAction, ReadyProperties } from './ReadyAction';
import { RefillFaceupAction, RefillFaceupProperties } from './RefillFaceupAction';
import { RemoveFateAction, RemoveFateProperties } from './RemoveFateAction';
import { RemoveFromGameAction, RemoveFromGameProperties } from './RemoveFromGameAction';
import { RemoveRingFromPlayAction, RemoveRingFromPlayProperties } from './RemoveRingFromPlayAction';
import { ResolveAbilityAction, ResolveAbilityProperties } from './ResolveAbilityAction';
import { ResolveConflictRingAction } from './ResolveConflictRingAction';
import { ResolveElementAction, ResolveElementProperties } from './ResolveElementAction';
import { RestoreProvinceAction, RestoreProvinceProperties } from './RestoreProvinceAction';
import { ReturnRingAction, ReturnRingProperties } from './ReturnRingAction';
import { ReturnRingToPlayAction, ReturnRingToPlayProperties } from './ReturnRingToPlayAction';
import { ReturnToDeckAction, ReturnToDeckProperties } from './ReturnToDeckAction';
import { ReturnToHandAction, ReturnToHandProperties } from './ReturnToHandAction';
import { RevealAction, RevealProperties } from './RevealAction';
import { RingActionProperties } from './RingAction';
import { SelectCardAction, SelectCardProperties } from './SelectCardAction';
import { SelectRingAction, SelectRingProperties } from './SelectRingActions';
import { SelectTokenAction, SelectTokenProperties } from './SelectTokenAction';
import { SendHomeAction, SendHomeProperties } from './SendHomeAction';
import { SequentialAction } from './SequentialAction';
import { SequentialContextAction, SequentialContextProperties } from './SequentialContextAction';
import { SetDialAction, SetDialProperties } from './SetDialAction';
import { ShuffleDeckAction, ShuffleDeckProperties } from './ShuffleDeckAction';
import { SwitchConflictElementAction, SwitchConflictElementProperties } from './SwitchConflictElementAction';
import { SwitchConflictTypeAction, SwitchConflictTypeProperties } from './SwitchConflictTypeAction';
import { TaintAction, TaintProperties } from './TaintAction';
import { TakeControlAction, TakeControlProperties } from './TakeControlAction';
import { TakeFateRingAction, TakeFateRingProperties } from './TakeFateRingAction';
import { TakeRingAction, TakeRingProperties } from './TakeRingAction';
import { TransferFateAction, TransferFateProperties } from './TransferFateAction';
import { TransferHonorAction, TransferHonorProperties } from './TransferHonorAction';
import { TriggerAbilityAction, TriggerAbilityProperties } from './TriggerAbilityAction';
import { TurnCardFacedownAction, TurnCardFacedownProperties } from './TurnCardFacedownAction';

type PropsFactory<Props> = Props | ((context: AbilityContext) => Props);

//////////////
// CARD
//////////////
export function addToken(propertyFactory: PropsFactory<AddTokenProperties> = {}): GameAction {
    return new AddTokenAction(propertyFactory);
}
export function attach(propertyFactory: PropsFactory<AttachActionProperties> = {}): GameAction {
    return new AttachAction(propertyFactory);
}
export function attachToRing(propertyFactory: PropsFactory<AttachToRingActionProperties> = {}): GameAction {
    return new AttachToRingAction(propertyFactory);
}
export function bow(propertyFactory: PropsFactory<BowActionProperties> = {}): CardGameAction {
    return new BowAction(propertyFactory);
}
export function breakProvince(propertyFactory: PropsFactory<BreakProperties> = {}): CardGameAction {
    return new BreakAction(propertyFactory);
}
export function cardLastingEffect(propertyFactory: PropsFactory<LastingEffectCardProperties>): GameAction {
    return new LastingEffectCardAction(propertyFactory);
}
export function claimImperialFavor(propertyFactory: PropsFactory<ClaimFavorProperties>): GameAction {
    return new ClaimFavorAction(propertyFactory);
}
export function createToken(propertyFactory: PropsFactory<CreateTokenProperties> = {}): GameAction {
    return new CreateTokenAction(propertyFactory);
}
export function detach(propertyFactory: PropsFactory<DetachActionProperties> = {}): GameAction {
    return new DetachAction(propertyFactory);
}
export function discardCard(propertyFactory: PropsFactory<DiscardCardProperties> = {}): CardGameAction {
    return new DiscardCardAction(propertyFactory);
}
export function discardFromPlay(propertyFactory: PropsFactory<DiscardFromPlayProperties> = {}): GameAction {
    return new DiscardFromPlayAction(propertyFactory);
}
export function dishonor(propertyFactory: PropsFactory<DishonorProperties> = {}): CardGameAction {
    return new DishonorAction(propertyFactory);
}
export function dishonorProvince(propertyFactory: PropsFactory<DishonorProvinceProperties> = {}): GameAction {
    return new DishonorProvinceAction(propertyFactory);
}
export function duel(propertyFactory: PropsFactory<DuelProperties>): GameAction {
    return new DuelAction(propertyFactory);
}
export function duelAddParticipant(propertyFactory: PropsFactory<DuelAddParticipantProperties>): GameAction {
    return new DuelAddParticipantAction(propertyFactory);
}
export function flipDynasty(propertyFactory: PropsFactory<FlipDynastyProperties> = {}): GameAction {
    return new FlipDynastyAction(propertyFactory);
}
export function flipImperialFavor(propertyFactory: PropsFactory<FlipFavorProperties>): GameAction {
    return new FlipFavorAction(propertyFactory);
}
export function honor(propertyFactory: PropsFactory<HonorProperties> = {}): GameAction {
    return new HonorAction(propertyFactory);
}
export function lookAt(propertyFactory: PropsFactory<LookAtProperties> = {}): GameAction {
    return new LookAtAction(propertyFactory);
}
/**
 * default switch = false
 * default shuffle = false
 * default faceup = false
 */
export function moveCard(propertyFactory: PropsFactory<MoveCardProperties>): CardGameAction {
    return new MoveCardAction(propertyFactory);
}
export function moveToConflict(propertyFactory: PropsFactory<MoveToConflictProperties> = {}): CardGameAction {
    return new MoveToConflictAction(propertyFactory);
}
/**
 * default amount = 1
 */
export function placeFate(propertyFactory: PropsFactory<PlaceFateProperties> = {}): GameAction {
    return new PlaceFateAction(propertyFactory);
}
/**
 * default amount = 1
 */
export function placeFateAttachment(propertyFactory: PropsFactory<PlaceFateAttachmentProperties> = {}): GameAction {
    return new PlaceFateAttachmentAction(propertyFactory);
}
/**
 * default resetOnCancel = false
 */
export function playCard(propertyFactory: PropsFactory<PlayCardProperties> = {}): GameAction {
    return new PlayCardAction(propertyFactory);
}
export function performGloryCount(propertyFactory: PropsFactory<GloryCountProperties>): GameAction {
    return new GloryCountAction(propertyFactory);
}
/**
 * default fate = 0
 * default status = ordinary
 */
export function putIntoConflict(propertyFactory: PropsFactory<PutIntoPlayProperties> = {}): GameAction {
    return new PutIntoPlayAction(propertyFactory);
}
/**
 * default fate = 0
 * default status = ordinary
 */
export function putIntoPlay(propertyFactory: PropsFactory<PutIntoPlayProperties> = {}): GameAction {
    return new PutIntoPlayAction(propertyFactory, false);
}
export function putIntoProvince(propertyFactory: PropsFactory<PutInProvinceProperties>): GameAction {
    return new PutInProvinceAction(propertyFactory);
}
/**
 * default fate = 0
 * default status = ordinary
 */
export function opponentPutIntoPlay(propertyFactory: PropsFactory<OpponentPutIntoPlayProperties> = {}): GameAction {
    return new OpponentPutIntoPlayAction(propertyFactory, false);
}
export function ready(propertyFactory: PropsFactory<ReadyProperties> = {}): GameAction {
    return new ReadyAction(propertyFactory);
}
/**
 * default amount = 1
 */
export function removeFate(propertyFactory: PropsFactory<RemoveFateProperties> = {}): CardGameAction {
    return new RemoveFateAction(propertyFactory);
}
export function removeFromGame(propertyFactory: PropsFactory<RemoveFromGameProperties> = {}): CardGameAction {
    return new RemoveFromGameAction(propertyFactory);
}
export function resolveAbility(propertyFactory: PropsFactory<ResolveAbilityProperties>): GameAction {
    return new ResolveAbilityAction(propertyFactory);
}
export function restoreProvince(propertyFactory: PropsFactory<RestoreProvinceProperties> = {}): GameAction {
    return new RestoreProvinceAction(propertyFactory);
}
/**
 * default bottom = false
 */
export function returnToDeck(propertyFactory: PropsFactory<ReturnToDeckProperties> = {}): CardGameAction {
    return new ReturnToDeckAction(propertyFactory);
}
export function returnToHand(propertyFactory: PropsFactory<ReturnToHandProperties> = {}): CardGameAction {
    return new ReturnToHandAction(propertyFactory);
}
/**
 * default chatMessage = false
 */
export function reveal(propertyFactory: PropsFactory<RevealProperties> = {}): CardGameAction {
    return new RevealAction(propertyFactory);
}
export function sendHome(propertyFactory: PropsFactory<SendHomeProperties> = {}): GameAction {
    return new SendHomeAction(propertyFactory);
}
export function sacrifice(propertyFactory: PropsFactory<DiscardFromPlayProperties> = {}): CardGameAction {
    return new DiscardFromPlayAction(propertyFactory, true);
}
export function taint(propertyFactory: PropsFactory<TaintProperties> = {}): CardGameAction {
    return new TaintAction(propertyFactory);
}
export function takeControl(propertyFactory: PropsFactory<TakeControlProperties> = {}): GameAction {
    return new TakeControlAction(propertyFactory);
}
export function triggerAbility(propertyFactory: PropsFactory<TriggerAbilityProperties>): GameAction {
    return new TriggerAbilityAction(propertyFactory);
}
export function turnFacedown(propertyFactory: PropsFactory<TurnCardFacedownProperties> = {}): GameAction {
    return new TurnCardFacedownAction(propertyFactory);
}
export function gainStatusToken(propertyFactory: PropsFactory<GainStatusTokenProperties> = {}): GameAction {
    return new GainStatusTokenAction(propertyFactory);
}
export function moveConflict(propertyFactory: PropsFactory<MoveConflictProperties> = {}): GameAction {
    return new MoveConflictAction(propertyFactory);
}
/**
 * default hideWhenFaceup = true
 */
export function placeCardUnderneath(propertyFactory: PropsFactory<PlaceCardUnderneathProperties>): GameAction {
    return new PlaceCardUnderneathAction(propertyFactory);
}

//////////////
// PLAYER
//////////////
/**
 * default amount = 1
 */
export function chosenDiscard(propertyFactory: PropsFactory<ChosenDiscardProperties> = {}): GameAction {
    return new ChosenDiscardAction(propertyFactory);
}
/**
 * default amount = 1
 */
export function chosenReturnToDeck(propertyFactory: PropsFactory<ChosenReturnToDeckProperties> = {}): GameAction {
    return new ChosenReturnToDeckAction(propertyFactory);
}
/**
 * default amount = -1 (whole deck)
 * default reveal = true
 * default cardCondition = always true
 */
export function deckSearch(propertyFactory: PropsFactory<DeckSearchProperties>): GameAction {
    return new DeckSearchAction(propertyFactory);
}
/**
 * default amount = 1
 */
export function discardAtRandom(propertyFactory: PropsFactory<RandomDiscardProperties> = {}): GameAction {
    return new RandomDiscardAction(propertyFactory);
}
/**
 * default amount = 1
 */
export function discardMatching(propertyFactory: PropsFactory<MatchingDiscardProperties> = {}): GameAction {
    return new MatchingDiscardAction(propertyFactory);
}
/**
 * default amount = 1
 */
export function draw(propertyFactory: PropsFactory<DrawProperties> = {}): GameAction {
    return new DrawAction(propertyFactory);
}
/**
 * default amount = 1
 * default faceup = false
 */
export function fillProvince(propertyFactory: PropsFactory<FillProvinceProperties>): GameAction {
    return new FillProvinceAction(propertyFactory);
}
export function gainFate(propertyFactory: PropsFactory<GainFateProperties> = {}): GameAction {
    return new GainFateAction(propertyFactory);
} // amount = 1
export function gainHonor(propertyFactory: PropsFactory<GainHonorProperties> = {}): GameAction {
    return new GainHonorAction(propertyFactory);
} // amount = 1
/**
 * default giveHonor = false
 * default players = Players.Any
 * default prohibitedBids = All bids allowed
 */
export function honorBid(propertyFactory: PropsFactory<HonorBidProperties> = {}): GameAction {
    return new HonorBidAction(propertyFactory);
}
export function fateBid(propertyFactory: PropsFactory<FateBidProperties> = {}): GameAction {
    return new FateBidAction(propertyFactory);
}
export function initiateConflict(propertyFactory: PropsFactory<InitiateConflictProperties> = {}): GameAction {
    return new InitiateConflictAction(propertyFactory);
} // canPass = true
export function loseFate(propertyFactory: PropsFactory<LoseFateProperties> = {}): GameAction {
    return new LoseFateAction(propertyFactory);
}
export function loseHonor(propertyFactory: PropsFactory<LoseHonorProperties> = {}): GameAction {
    return new LoseHonorAction(propertyFactory);
} // amount = 1
export function loseImperialFavor(propertyFactory: PropsFactory<DiscardFavorProperties> = {}): GameAction {
    return new DiscardFavorAction(propertyFactory);
}
export function modifyBid(propertyFactory: PropsFactory<ModifyBidProperties> = {}): GameAction {
    return new ModifyBidAction(propertyFactory);
} // amount = 1, direction = 'increast', promptPlayer = false
export function playerLastingEffect(propertyFactory: PropsFactory<LastingEffectProperties>): GameAction {
    return new LastingEffectAction(propertyFactory);
} // duration = 'untilEndOfConflict', effect, targetController, condition, until
export function refillFaceup(propertyFactory: PropsFactory<RefillFaceupProperties>): GameAction {
    return new RefillFaceupAction(propertyFactory);
} // location
export function setHonorDial(propertyFactory: PropsFactory<SetDialProperties>): GameAction {
    return new SetDialAction(propertyFactory);
} // value
export function shuffleDeck(propertyFactory: PropsFactory<ShuffleDeckProperties>): GameAction {
    return new ShuffleDeckAction(propertyFactory);
}
export function takeFate(propertyFactory: PropsFactory<TransferFateProperties> = {}): GameAction {
    return new TransferFateAction(propertyFactory);
} // amount = 1
export function takeHonor(propertyFactory: PropsFactory<TransferHonorProperties> = {}): GameAction {
    return new TransferHonorAction(propertyFactory);
} // amount = 1

//////////////
// RING
//////////////
export function placeFateOnRing(propertyFactory: PropsFactory<PlaceFateRingProperties> = {}): GameAction {
    return new PlaceFateRingAction(propertyFactory);
} // amount = 1, origin
export function resolveConflictRing(propertyFactory: PropsFactory<RingActionProperties> = {}): GameAction {
    return new ResolveConflictRingAction(propertyFactory);
} // resolveAsAttacker = true
export function resolveRingEffect(propertyFactory: PropsFactory<ResolveElementProperties> = {}): GameAction {
    return new ResolveElementAction(propertyFactory);
} // options = false
export function returnRing(propertyFactory: PropsFactory<ReturnRingProperties> = {}): GameAction {
    return new ReturnRingAction(propertyFactory);
}
export function ringLastingEffect(propertyFactory: PropsFactory<LastingEffectRingProperties>): GameAction {
    return new LastingEffectRingAction(propertyFactory);
} // duration = 'untilEndOfConflict', effect, condition, until
export function selectRing(propertyFactory: PropsFactory<SelectRingProperties>): GameAction {
    return new SelectRingAction(propertyFactory);
}
export function switchConflictElement(propertyFactory: PropsFactory<SwitchConflictElementProperties> = {}): GameAction {
    return new SwitchConflictElementAction(propertyFactory);
}
export function switchConflictType(propertyFactory: PropsFactory<SwitchConflictTypeProperties> = {}): GameAction {
    return new SwitchConflictTypeAction(propertyFactory);
}
export function takeFateFromRing(propertyFactory: PropsFactory<TakeFateRingProperties> = {}): GameAction {
    return new TakeFateRingAction(propertyFactory);
} // amount = 1
export function takeRing(propertyFactory: PropsFactory<TakeRingProperties> = {}): GameAction {
    return new TakeRingAction(propertyFactory);
}
export function claimRing(propertyFactory: PropsFactory<ClaimRingProperties> = {}): GameAction {
    return new ClaimRingAction(propertyFactory);
}
export function removeRingFromPlay(propertyFactory: PropsFactory<RemoveRingFromPlayProperties> = {}): GameAction {
    return new RemoveRingFromPlayAction(propertyFactory);
}
export function returnRingToPlay(propertyFactory: PropsFactory<ReturnRingToPlayProperties> = {}): GameAction {
    return new ReturnRingToPlayAction(propertyFactory);
}

//////////////
// STATUS TOKEN
//////////////
export function discardStatusToken(propertyFactory: PropsFactory<DiscardStatusProperties> = {}): GameAction {
    return new DiscardStatusAction(propertyFactory);
}
export function moveStatusToken(propertyFactory: PropsFactory<MoveTokenProperties>): GameAction {
    return new MoveTokenAction(propertyFactory);
}

//////////////
// GENERIC
//////////////
export function cancel(propertyFactory: PropsFactory<CancelActionProperties> = {}): GameAction {
    return new CancelAction(propertyFactory);
}
export function handler(propertyFactory: PropsFactory<HandlerProperties>): GameAction {
    return new HandlerAction(propertyFactory);
}
export function noAction(): GameAction {
    return new HandlerAction({});
}

//////////////
// CONFLICT
//////////////
export function conflictLastingEffect(propertyFactory: PropsFactory<LastingEffectProperties>): GameAction {
    return new LastingEffectAction(propertyFactory);
} // duration = 'untilEndOfConflict', effect, targetController, condition, until
export function immediatelyResolveConflict(): GameAction {
    return new HandlerAction({});
}

//////////////
// DUEL
//////////////
export function duelLastingEffect(propertyFactory: PropsFactory<LastingEffectProperties>): GameAction {
    return new LastingEffectAction(propertyFactory);
} // duration = 'untilEndOfConflict', effect, targetController, condition, until

//////////////
// META
//////////////
export function cardMenu(propertyFactory: PropsFactory<CardMenuProperties>): GameAction {
    return new CardMenuAction(propertyFactory);
}
export function chooseAction(propertyFactory: PropsFactory<ChooseActionProperties>): GameAction {
    return new ChooseGameAction(propertyFactory);
} // choices, activePromptTitle = 'Select one'
export function conditional(propertyFactory: PropsFactory<ConditionalActionProperties>): GameAction {
    return new ConditionalAction(propertyFactory);
}
export function onAffinity(propertyFactory: PropsFactory<AffinityActionProperties>): GameAction {
    return new AffinityAction(propertyFactory);
}
export function ifAble(propertyFactory: PropsFactory<IfAbleActionProperties>): GameAction {
    return new IfAbleAction(propertyFactory);
}
export function joint(gameActions: GameAction[]): GameAction {
    return new JointGameAction(gameActions);
} // takes an array of gameActions, not a propertyFactory
export function multiple(gameActions: GameAction[]): GameAction {
    return new MultipleGameAction(gameActions);
} // takes an array of gameActions, not a propertyFactory
export function multipleContext(propertyFactory: PropsFactory<MultipleContextActionProperties>): GameAction {
    return new MultipleContextGameAction(propertyFactory);
}
export function menuPrompt(propertyFactory: PropsFactory<MenuPromptProperties>): GameAction {
    return new MenuPromptAction(propertyFactory);
}
export function selectCard(propertyFactory: PropsFactory<SelectCardProperties>): GameAction {
    return new SelectCardAction(propertyFactory);
}
export function selectToken(propertyFactory: PropsFactory<SelectTokenProperties>): GameAction {
    return new SelectTokenAction(propertyFactory);
}
export function sequential(gameActions: GameAction[]): GameAction {
    return new SequentialAction(gameActions);
} // takes an array of gameActions, not a propertyFactory
export function sequentialContext(propertyFactory: PropsFactory<SequentialContextProperties>): GameAction {
    return new SequentialContextAction(propertyFactory);
}