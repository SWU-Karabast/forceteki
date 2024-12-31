import { GameSystem } from '../core/gameSystem/GameSystem';
import type { AbilityContext } from '../core/ability/AbilityContext';
import { ZoneName, DeckZoneDestination, PlayType, RelativePlayer } from '../core/Constants';
import type { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';

import type { AggregateSystem, ISystemArrayOrFactory } from '../core/gameSystem/AggregateSystem';
import type { IAttachUpgradeProperties } from './AttachUpgradeSystem';
import { AttachUpgradeSystem } from './AttachUpgradeSystem';
import type { ICaptureProperties } from './CaptureSystem';
import { CaptureSystem } from './CaptureSystem';
import type { ICardAttackLastingEffectProperties } from './CardAttackLastingEffectSystem';
import { CardAttackLastingEffectSystem } from './CardAttackLastingEffectSystem';
import type { ICardLastingEffectProperties } from './CardLastingEffectSystem';
import { CardLastingEffectSystem } from './CardLastingEffectSystem';
import type { ICardPhaseLastingEffectProperties } from './CardPhaseLastingEffectSystem';
import { CardPhaseLastingEffectSystem } from './CardPhaseLastingEffectSystem';
import type { CardTargetSystem, ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import type { IPlayModalCardProperties } from './ChooseModalEffectsSystem';
import { ChooseModalEffectsSystem } from './ChooseModalEffectsSystem';
import type { IConditionalSystemProperties } from './ConditionalSystem';
import { ConditionalSystem } from './ConditionalSystem';
import type { ICreateBattleDroidProperties } from './CreateBattleDroidSystem';
import { CreateBattleDroidSystem } from './CreateBattleDroidSystem';
import type { ICreateCloneTrooperProperties } from './CreateCloneTrooperSystem';
import { CreateCloneTrooperSystem } from './CreateCloneTrooperSystem';
import type { IDamageProperties } from './DamageSystem';
import { DamageSystem } from './DamageSystem';
import type { IDefeatCardProperties } from './DefeatCardSystem';
import { DefeatCardSystem } from './DefeatCardSystem';
import type { IDelayedEffectSystemProperties } from './DelayedEffectSystem';
import { DelayedEffectSystem, DelayedEffectType } from './DelayedEffectSystem';
import type { IDeployLeaderProperties } from './DeployLeaderSystem';
import { DeployLeaderSystem } from './DeployLeaderSystem';
import type { IDiscardCardsFromHandProperties } from './DiscardCardsFromHandSystem';
import { DiscardCardsFromHandSystem } from './DiscardCardsFromHandSystem';
import type { IDiscardEntireHandSystemProperties } from './DiscardEntireHandSystem';
import { DiscardEntireHandSystem } from './DiscardEntireHandSystem';
import type { IDiscardFromDeckProperties } from './DiscardFromDeckSystem';
import { DiscardFromDeckSystem } from './DiscardFromDeckSystem';
import type { IDiscardSpecificCardProperties } from './DiscardSpecificCardSystem';
import { DiscardSpecificCardSystem } from './DiscardSpecificCardSystem';
import type { IDistributeDamageSystemProperties } from './DistributeDamageSystem';
import { DistributeDamageSystem } from './DistributeDamageSystem';
import type { IDistributeExperienceSystemProperties } from './DistributeExperienceSystem';
import { DistributeExperienceSystem } from './DistributeExperienceSystem';
import type { IDistributeHealingSystemProperties } from './DistributeHealingSystem';
import { DistributeHealingSystem } from './DistributeHealingSystem';
import type { IDrawSpecificCardProperties } from './DrawSpecificCardSystem';
import { DrawSpecificCardSystem } from './DrawSpecificCardSystem';
import type { IDrawProperties } from './DrawSystem';
import { DrawSystem } from './DrawSystem';
import type { IExecuteHandlerSystemProperties } from './ExecuteHandlerSystem';
import { ExecuteHandlerSystem } from './ExecuteHandlerSystem';
import type { IExhaustResourcesProperties } from './ExhaustResourcesSystem';
import { ExhaustResourcesSystem } from './ExhaustResourcesSystem';
import type { IExhaustSystemProperties } from './ExhaustSystem';
import { ExhaustSystem } from './ExhaustSystem';
import type { IGiveExperienceProperties } from './GiveExperienceSystem';
import { GiveExperienceSystem } from './GiveExperienceSystem';
import type { IGiveShieldProperties } from './GiveShieldSystem';
import { GiveShieldSystem } from './GiveShieldSystem';
import type { IHealProperties } from './HealSystem';
import { HealSystem } from './HealSystem';
import type { IInitiateAttackProperties } from './InitiateAttackSystem';
import { InitiateAttackSystem } from './InitiateAttackSystem';
import type { ILookAtProperties } from './LookAtSystem';
import { LookAtSystem } from './LookAtSystem';
import type { ILookMoveDeckCardsTopOrBottomProperties } from './LookMoveDeckCardsTopOrBottomSystem';
import { LookMoveDeckCardsTopOrBottomSystem } from './LookMoveDeckCardsTopOrBottomSystem';
import type { IMoveCardProperties } from './MoveCardSystem';
import { MoveCardSystem } from './MoveCardSystem';
import type { INoActionSystemProperties } from './NoActionSystem';
import { NoActionSystem } from './NoActionSystem';
import type { IPlayCardProperties } from '../gameSystems/PlayCardSystem';
import { PlayCardSystem } from '../gameSystems/PlayCardSystem';
import type { IPlayerLastingEffectProperties } from './PlayerLastingEffectSystem';
import { PlayerLastingEffectSystem } from './PlayerLastingEffectSystem';
import type { IPlayerPhaseLastingEffectProperties } from './PlayerPhaseLastingEffectSystem';
import { PlayerPhaseLastingEffectSystem } from './PlayerPhaseLastingEffectSystem';
import type { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type { IPutIntoPlayProperties } from './PutIntoPlaySystem';
import { PutIntoPlaySystem } from './PutIntoPlaySystem';
import type { IReadyResourcesSystemProperties } from './ReadyResourcesSystem';
import { ReadyResourcesSystem } from './ReadyResourcesSystem';
import type { IReadySystemProperties } from './ReadySystem';
import { ReadySystem } from './ReadySystem';
import type { IReplacementEffectSystemProperties } from './ReplacementEffectSystem';
import { ReplacementEffectSystem } from './ReplacementEffectSystem';
import type { IRescueProperties } from './RescueSystem';
import { RescueSystem } from './RescueSystem';
import type { IResourceCardProperties } from './ResourceCardSystem';
import { ResourceCardSystem } from './ResourceCardSystem';
import type { IRevealProperties } from './RevealSystem';
import { RevealSystem } from './RevealSystem';
import type { ISearchDeckProperties } from './SearchDeckSystem';
import { SearchDeckSystem } from './SearchDeckSystem';
import type { ISelectCardProperties } from './SelectCardSystem';
import { SelectCardSystem } from './SelectCardSystem';
import { SequentialSystem } from './SequentialSystem';
import type { IShuffleDeckProperties } from './ShuffleDeckSystem';
import { ShuffleDeckSystem } from './ShuffleDeckSystem';
import { SimultaneousGameSystem } from './SimultaneousSystem';
import type { ITakeControlProperties } from './TakeControlOfUnitSystem';
import { TakeControlOfUnitSystem } from './TakeControlOfUnitSystem';

import * as Helpers from '../core/utils/Helpers';

type PropsFactory<Props, TContext extends AbilityContext = AbilityContext> = Props | ((context: TContext) => Props);

// allow block comments without spaces so we can have compact jsdoc descriptions in this file
/* eslint @stylistic/lines-around-comment: off */

// ////////////
// CARD
// ////////////
// export function addToken(propertyFactory: PropsFactory<AddTokenProperties> = {}): GameSystem {
//     return new AddTokenAction(propertyFactory);
// }
export function attachUpgrade<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IAttachUpgradeProperties, TContext> = {}): GameSystem<TContext> {
    return new AttachUpgradeSystem<TContext>(propertyFactory);
}
export function attack<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IInitiateAttackProperties, TContext> = {}): CardTargetSystem<TContext> {
    return new InitiateAttackSystem<TContext>(propertyFactory);
}
export function capture<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<ICaptureProperties, TContext> = {}) {
    return new CaptureSystem<TContext>(propertyFactory);
}
export function cardLastingEffect<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<ICardLastingEffectProperties, TContext>): GameSystem<TContext> {
    return new CardLastingEffectSystem<TContext>(propertyFactory);
}
export function createBattleDroid<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<ICreateBattleDroidProperties, TContext> = {}) {
    return new CreateBattleDroidSystem<TContext>(propertyFactory);
}
export function createCloneTrooper<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<ICreateCloneTrooperProperties, TContext> = {}) {
    return new CreateCloneTrooperSystem<TContext>(propertyFactory);
}
export function damage<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IDamageProperties, TContext>) {
    return new DamageSystem<TContext, IDamageProperties>(propertyFactory);
}
export function distributeDamageAmong<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IDistributeDamageSystemProperties, TContext>) {
    return new DistributeDamageSystem<TContext>(propertyFactory);
}
export function distributeHealingAmong<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IDistributeHealingSystemProperties, TContext>) {
    return new DistributeHealingSystem<TContext>(propertyFactory);
}
export function distributeExperienceAmong<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IDistributeExperienceSystemProperties, TContext>) {
    return new DistributeExperienceSystem<TContext>(propertyFactory);
}
// export function detach(propertyFactory: PropsFactory<DetachActionProperties> = {}): GameSystem {
//     return new DetachAction(propertyFactory);
// }
export function deploy<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IDeployLeaderProperties, TContext> = {}): CardTargetSystem<TContext> {
    return new DeployLeaderSystem<TContext>(propertyFactory);
}
export function defeat<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IDefeatCardProperties, TContext> = {}): CardTargetSystem<TContext> {
    return new DefeatCardSystem<TContext>(propertyFactory);
}
export function discardFromDeck<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IDiscardFromDeckProperties, TContext> = {}): PlayerTargetSystem<TContext> {
    return new DiscardFromDeckSystem<TContext>(propertyFactory);
}
export function discardSpecificCard<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IDiscardSpecificCardProperties, TContext> = {}): DiscardSpecificCardSystem<TContext> {
    return new DiscardSpecificCardSystem<TContext>(propertyFactory);
}
// export function discardFromPlay(propertyFactory: PropsFactory<DiscardFromPlayProperties> = {}): GameSystem {
//     return new DiscardFromPlayAction(propertyFactory);
// }
export function exhaust<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IExhaustSystemProperties, TContext> = {}): CardTargetSystem<TContext> {
    return new ExhaustSystem<TContext>(propertyFactory);
}
export function forThisPhaseCardEffect<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<ICardPhaseLastingEffectProperties, TContext>) {
    return new CardPhaseLastingEffectSystem<TContext>(propertyFactory);
}
export function forThisAttackCardEffect<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<ICardAttackLastingEffectProperties, TContext>) {
    return new CardAttackLastingEffectSystem<TContext>(propertyFactory);
}
export function giveExperience<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IGiveExperienceProperties, TContext> = {}): CardTargetSystem<TContext> {
    return new GiveExperienceSystem<TContext>(propertyFactory);
}
export function giveShield<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IGiveShieldProperties, TContext> = {}): CardTargetSystem<TContext> {
    return new GiveShieldSystem<TContext>(propertyFactory);
}
export function heal<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IHealProperties, TContext>) {
    return new HealSystem<TContext>(propertyFactory);
}
export function lookAt<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<ILookAtProperties, TContext> = {}): GameSystem<TContext> {
    return new LookAtSystem<TContext>(propertyFactory);
}

export function lookMoveDeckCardsTopOrBottom<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<ILookMoveDeckCardsTopOrBottomProperties, TContext>): CardTargetSystem<TContext> {
    return new LookMoveDeckCardsTopOrBottomSystem<TContext>(propertyFactory);
}
/**
 * default switch = false
 * default shuffle = false
 * default faceup = false
 */
export function moveCard<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IMoveCardProperties, TContext>): CardTargetSystem<TContext> {
    return new MoveCardSystem<TContext>(propertyFactory);
}

export function moveToBottomOfDeck<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IMoveCardProperties, TContext> = {}): CardTargetSystem<TContext> {
    return new MoveCardSystem<TContext>(
        GameSystem.appendToPropertiesOrPropertyFactory<IMoveCardProperties, 'destination'>(
            propertyFactory,
            { destination: DeckZoneDestination.DeckBottom }
        )
    );
}

export function moveToTopOfDeck<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<ICardTargetSystemProperties, TContext>): CardTargetSystem<TContext> {
    return new MoveCardSystem<TContext>(
        GameSystem.appendToPropertiesOrPropertyFactory<IMoveCardProperties, 'destination'>(
            propertyFactory,
            { destination: DeckZoneDestination.DeckTop }
        )
    );
}

/**
 * default resetOnCancel = false
 */
export function playCard<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IPlayCardProperties, TContext> = {}): PlayCardSystem<TContext> {
    return new PlayCardSystem(propertyFactory);
}
export function playCardFromHand<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<Omit<IPlayCardProperties, 'playType' | 'optional'>, TContext> = {}): PlayCardSystem<TContext> {
    // TODO: implement playing with smuggle and from non-standard zones(discard(e.g. Palpatine's Return), top of deck(e.g. Ezra Bridger), etc.) as part of abilities with another function(s)
    // TODO: implement a "nested" property in PlayCardSystem that controls whether triggered abilities triggered by playing the card resolve after that card play or after the whole ability
    // playType automatically defaults to PlayFromHand
    return new PlayCardSystem(propertyFactory);
}
export function playCardFromOutOfPlay<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<Omit<IPlayCardProperties, 'playType' | 'optional'>, TContext> = {}): PlayCardSystem<TContext> {
    return new PlayCardSystem<TContext>(
        GameSystem.appendToPropertiesOrPropertyFactory<IPlayCardProperties, 'playType'>(
            propertyFactory,
            { playType: PlayType.PlayFromOutOfPlay }
        )
    );
}


export function chooseModalEffects<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IPlayModalCardProperties, TContext>) {
    return new ChooseModalEffectsSystem<TContext>(propertyFactory);
}
export function exhaustResources<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IExhaustResourcesProperties, TContext>): GameSystem<TContext> {
    return new ExhaustResourcesSystem<TContext>(propertyFactory);
}

export function payResourceCost<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IExhaustResourcesProperties, TContext>): GameSystem<TContext> {
    return new ExhaustResourcesSystem<TContext>(
        GameSystem.appendToPropertiesOrPropertyFactory<IExhaustResourcesProperties, 'isCost'>(
            propertyFactory,
            { isCost: true }
        )
    );
}

/**
 * default status = ordinary
 */
export function putIntoPlay<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IPutIntoPlayProperties, TContext> = {}): GameSystem<TContext> {
    return new PutIntoPlaySystem<TContext>(propertyFactory);
}
// /**
//  * default status = ordinary
//  */
// export function opponentPutIntoPlay(propertyFactory: PropsFactory<OpponentPutIntoPlayProperties> = {}): GameSystem {
//     return new OpponentPutIntoPlayAction(propertyFactory, false);
// }
export function ready<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IReadySystemProperties, TContext> = {}) {
    return new ReadySystem<TContext>(propertyFactory);
}
export function rescue<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IRescueProperties, TContext> = {}) {
    return new RescueSystem<TContext>(propertyFactory);
}

/**
 * default changePlayers = false
 */
export function resourceCard<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IResourceCardProperties, TContext> = {}): CardTargetSystem<TContext> {
    return new ResourceCardSystem<TContext>(propertyFactory);
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

/**
 * Returns a card to the player's hand from any arena, discard pile, or resources.
 *
 * @param {PropsFactory<ICardTargetSystemProperties, TContext>} [propertyFactory={}] - A factory function or properties object to create the card target system properties.
 * @returns {CardTargetSystem<TContext>} A new instance of the {@link MoveCardSystem} configured to move a card to the player's hand.
 */
export function returnToHand<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<ICardTargetSystemProperties, TContext> = {}): CardTargetSystem<TContext> {
    return new MoveCardSystem<TContext>(
        GameSystem.appendToPropertiesOrPropertyFactory<IMoveCardProperties, 'destination'>(
            propertyFactory,
            { destination: ZoneName.Hand }
        )
    );
}

/**
 * default chatMessage = false
 */
export function reveal<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IRevealProperties, TContext> = {}): CardTargetSystem<TContext> {
    return new RevealSystem<TContext>(propertyFactory);
}
// export function sacrifice(propertyFactory: PropsFactory<DiscardFromPlayProperties> = {}): CardGameAction {
//     return new DiscardFromPlayAction(propertyFactory, true);
// }
export function takeControlOfUnit<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<ITakeControlProperties, TContext>) {
    return new TakeControlOfUnitSystem(propertyFactory);
}
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
export function discardCardsFromOwnHand<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<Omit<IDiscardCardsFromHandProperties, 'choosingPlayer'>, TContext>): DiscardCardsFromHandSystem<TContext> {
    const wrappedPropertyFactory: PropsFactory<IDiscardCardsFromHandProperties, TContext> = (context: TContext) => {
        const properties = typeof propertyFactory === 'function' ? propertyFactory(context) : propertyFactory;
        return {
            ...properties,
            choosingPlayer: RelativePlayer.Self
        };
    };

    return new DiscardCardsFromHandSystem<TContext>(wrappedPropertyFactory);
}

export function discardCardsFromOpponentsHand<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<Omit<IDiscardCardsFromHandProperties, 'choosingPlayer'>, TContext>): DiscardCardsFromHandSystem<TContext> {
    const wrappedPropertyFactory: PropsFactory<IDiscardCardsFromHandProperties, TContext> = (context: TContext) => {
        const properties = typeof propertyFactory === 'function' ? propertyFactory(context) : propertyFactory;
        return {
            ...properties,
            choosingPlayer: RelativePlayer.Opponent,
        };
    };

    return new DiscardCardsFromHandSystem<TContext>(wrappedPropertyFactory);
}

/**
 * Creates a new instance of a system that discards the entire hand of the target player(s).
 *
 * By default, this system will target the opponent of the player who initiated the ability.
 */
export function discardEntireHand<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IDiscardEntireHandSystemProperties, TContext> = {}): DiscardEntireHandSystem<TContext> {
    return new DiscardEntireHandSystem<TContext>(propertyFactory);
}
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
export function deckSearch<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<ISearchDeckProperties<TContext>, TContext>): GameSystem<TContext> {
    return new SearchDeckSystem<TContext>(propertyFactory);
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
export function draw<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IDrawProperties, TContext> = {}): DrawSystem<TContext> {
    return new DrawSystem<TContext>(propertyFactory);
}

/**
 * default amount = 1
 */
export function drawSpecificCard<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IDrawSpecificCardProperties, TContext> = {}): CardTargetSystem<TContext> {
    return new DrawSpecificCardSystem<TContext>(propertyFactory);
}
export function forThisPhasePlayerEffect<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IPlayerPhaseLastingEffectProperties, TContext>) {
    return new PlayerPhaseLastingEffectSystem<TContext>(propertyFactory);
}
export function readyResources<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IReadyResourcesSystemProperties, TContext>): GameSystem<TContext> {
    return new ReadyResourcesSystem<TContext>(propertyFactory);
}
export function playerLastingEffect<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IPlayerLastingEffectProperties>): GameSystem<TContext> {
    return new PlayerLastingEffectSystem<TContext>(propertyFactory);
}
export function delayedCardEffect<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<Omit<IDelayedEffectSystemProperties, 'effectType'>>) {
    return new DelayedEffectSystem<TContext>(
        GameSystem.appendToPropertiesOrPropertyFactory<IDelayedEffectSystemProperties, 'effectType'>(
            propertyFactory,
            { effectType: DelayedEffectType.Card }
        ));
}
export function delayedPlayerEffect<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<Omit<IDelayedEffectSystemProperties, 'effectType'>>) {
    return new DelayedEffectSystem<TContext>(
        GameSystem.appendToPropertiesOrPropertyFactory<IDelayedEffectSystemProperties, 'effectType'>(
            propertyFactory,
            { effectType: DelayedEffectType.Player }
        ));
}

// //////////////
// // GENERIC
// //////////////
export function handler<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IExecuteHandlerSystemProperties, TContext>): GameSystem<TContext> {
    return new ExecuteHandlerSystem<TContext>(propertyFactory);
}
export function noAction<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<INoActionSystemProperties, TContext> = {}): GameSystem<TContext> {
    return new NoActionSystem<TContext>(propertyFactory);
}
export function replacementEffect<TContext extends TriggeredAbilityContext = TriggeredAbilityContext>(propertyFactory: PropsFactory<IReplacementEffectSystemProperties, TContext>): GameSystem<TContext> {
    return new ReplacementEffectSystem<TContext>(propertyFactory);
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
// TODO: remove the return type from all of these
export function conditional<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IConditionalSystemProperties<TContext>, TContext>) {
    return new ConditionalSystem<TContext>(propertyFactory);
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
export function selectCard<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<ISelectCardProperties<TContext>, TContext>): GameSystem<TContext> {
    return new SelectCardSystem<TContext>(propertyFactory);
}
// export function selectToken(propertyFactory: PropsFactory<SelectTokenProperties>): GameSystem {
//     return new SelectTokenAction(propertyFactory);
// }
export function sequential<TContext extends AbilityContext = AbilityContext>(gameSystems: ISystemArrayOrFactory<TContext>): AggregateSystem<TContext> {
    return new SequentialSystem<TContext>(gameSystems);
} // takes an array of gameActions, not a propertyFactory
export function simultaneous<TContext extends AbilityContext = AbilityContext>(gameSystems: ISystemArrayOrFactory<TContext>, ignoreTargetingRequirements = null): GameSystem<TContext> {
    return new SimultaneousGameSystem<TContext>(gameSystems, ignoreTargetingRequirements);
}

export function shuffleDeck<TContext extends AbilityContext = AbilityContext>(propertyFactory: PropsFactory<IShuffleDeckProperties, TContext> = {}): PlayerTargetSystem<TContext> {
    return new ShuffleDeckSystem<TContext>(propertyFactory);
}
