type ISerializedGameState = import('../../server/game/Interfaces').ISerializedGameState;
type PhaseName = import('../../server/game/core/Constants').PhaseName;
type IBaseCard = import('../../server/game/core/card/BaseCard').IBaseCard;
type ILeaderCard = import('../../server/game/core/card/propertyMixins/LeaderProperties').ILeaderCard;
type Card = import('../../server/game/core/card/Card').Card;
type DeckBuilder = import('./DeckBuilder').DeckBuilder;
type CardWithDamageProperty = import('../../server/game/core/card/CardTypes').CardWithDamageProperty;
type Game = import('../../server/game/core/Game');
type Player = import('../../server/game/core/Player');
type GameFlowWrapper = import('./GameFlowWrapper');
type PlayerInteractionWrapper = import('./PlayerInteractionWrapper');
type SnapshotManager = import('../../server/game/core/snapshot/SnapshotManager').SnapshotManager;
type SnapshotType = import('../../server/game/core/Constants').SnapshotType;
type IGetSnapshotSettings = import('../../server/game/core/snapshot/SnapshotInterfaces').IGetSnapshotSettings;
type SnapshotManager = import('../../server/game/core/snapshot/SnapshotManager').SnapshotManager;

declare let integration: (definitions: ((contextRef: SwuTestContextRef) => void) | (() => void)) => void;

declare let undoIntegration: (definitions: ((contextRef: SwuTestContextRef) => void) | (() => void)) => void;

type SnapshotTypeValue = `${SnapshotType}`;

interface ITestGetSnapshotSettings {
    type: SnapshotTypeValue;
    phaseOffset?: number;
    actionOffset?: number;
    snapshotId?: number;
    playerId?: string;
    phaseName?: string;
}

interface SnapshotUtils {
    startOfTestSnapshot?: { player: Player; snapshotId: number };

    getCurrentSnapshotId(): number | null;
    getCurrentSnapshottedAction(): number | null;

    countAvailableActionSnapshots: (playerId: string) => number;
    countAvailableManualSnapshots: (playerId: string) => number;
    rollbackToSnapshot: (settings: ITestGetSnapshotSettings) => boolean;
    takeManualSnapshot: (playerId: string) => number;
}

interface SwuTestContextRef {
    context: SwuTestContext;
    snapshot?: SnapshotUtils;
    setupTestAsync: (options?: SwuSetupTestOptions) => Promise;

    buildImportAllCardsTools: () => {
        deckBuilder: DeckBuilder;
        implementedCardsCtors: Map<string, new (owner: Player, cardData: any) => Card>;
        unimplementedCardCtor: new (owner: Player, cardData: any) => Card;
    };
}

interface SwuTestContext {
    flow: GameFlowWrapper;
    game: Game;
    player1Object: Player;
    player2Object: Player;
    player1Name: string;
    player2Name: string;
    player1: PlayerInteractionWrapper;
    player2: PlayerInteractionWrapper;
    p1Base: IBaseCard;
    p1Leader: ILeaderCard;
    p2Base: IBaseCard;
    p2Leader: ILeaderCard;

    ignoreUnresolvedActionPhasePrompts: boolean;
    requireResolvedRegroupPhasePrompts: boolean;

    advancePhases(endphase);
    allPlayersInInitiativeOrder(): PlayerInteractionWrapper[];
    getPlayableCardTitles();
    getChatLog(numbBack = 0);
    getChatLogs(numbBack = 1, inOrder = false);
    getPromptedPlayer(title: string);
    keepStartingHand();
    moveToNextActionPhase();
    moveToRegroupPhase();
    nextPhase();
    selectInitiativePlayer(player: PlayerInteractionWrapper);
    setDamage(card: CardWithDamageProperty, amount: number);
    exhaustCard(card: ICardWithExhaustProperty);
    readyCard(card: ICardWithExhaustProperty);
    skipSetupPhase();
    startGameAsync(): Promise;

    // To account for any dynamically added cards or objects, we have a free-form accessor.
    [field: string]: any;
}

interface PlayerInfo {
    id: string;
    username: string;
}

interface SwuSetupTestOptions extends ISerializedGameState {
    autoSingleTarget?: boolean;
    phaseTransitionHandler?: (phase: PhaseName) => void;
    testUndo?: boolean;

    [field: string]: any;
}

interface ICardDisplaySelectionState {
    selectable?: Card[];
    selected?: Card[];
    unselectable?: Card[];
    invalid?: Card[];
    usesSelectionOrder?: boolean;
}

declare namespace jasmine {
    export interface Matchers<T> {
        toHavePrompt<T extends PlayerInteractionWrapper>(this: Matchers<T>, expected: any): boolean;
        toHaveEnabledPromptButton<T extends PlayerInteractionWrapper>(this: Matchers<T>, expected: string): boolean;
        toHaveEnabledPromptButtons<T extends PlayerInteractionWrapper>(this: Matchers<T>, expecteds: string[]): boolean;
        toHaveDisabledPromptButton<T extends PlayerInteractionWrapper>(this: Matchers<T>, expected: string): boolean;
        toHaveDisabledPromptButtons<T extends PlayerInteractionWrapper>(this: Matchers<T>, expecteds: string[]): boolean;
        toHavePassAbilityButton<T extends PlayerInteractionWrapper>(this: Matchers<T>): boolean;
        toHavePassAttackButton<T extends PlayerInteractionWrapper>(this: Matchers<T>): boolean;
        toHaveChooseNothingButton<T extends PlayerInteractionWrapper>(this: Matchers<T>): boolean;
        toHaveClaimInitiativeAbilityButton<T extends PlayerInteractionWrapper>(this: Matchers<T>): boolean;
        toBeAbleToSelect<T extends PlayerInteractionWrapper>(this: Matchers<T>, card: any): boolean;
        toBeAbleToSelectAllOf<T extends PlayerInteractionWrapper>(this: Matchers<T>, cards: any[]): boolean;
        toBeAbleToSelectNoneOf<T extends PlayerInteractionWrapper>(this: Matchers<T>, cards: any[]): boolean;
        toBeAbleToSelectExactly<T extends PlayerInteractionWrapper>(this: Matchers<T>, cards: any[]): boolean;
        toHaveAvailableActionWhenClickedBy(player: PlayerInteractionWrapper): boolean;
        toBeActivePlayer<T extends PlayerInteractionWrapper>(this: Matchers<T>): boolean;
        toHaveInitiative<T extends PlayerInteractionWrapper>(this: Matchers<T>): boolean;
        toHavePassAbilityPrompt<T extends PlayerInteractionWrapper>(this: Matchers<T>, abilityText: any): boolean;
        toHavePassSingleTargetPrompt<T extends PlayerInteractionWrapper>(this: Matchers<T>, abilityText: any, target: any): boolean;
        toBeInBottomOfDeck(player: PlayerInteractionWrapper, numCards: number): boolean;
        toAllBeInBottomOfDeck(player: PlayerInteractionWrapper, numCards: number): boolean;
        toBeInZone(zone, player?: PlayerInteractionWrapper): boolean;
        toAllBeInZone(zone, player?: PlayerInteractionWrapper): boolean;
        toBeCapturedBy(card: any): boolean;
        toBeAttachedTo(card: any): boolean;
        toHaveExactUpgradeNames(upgradeNames: any[]): boolean;
        toHaveExactPromptButtons<T extends PlayerInteractionWrapper>(this: Matchers<T>, buttons: any[]): boolean;
        toHaveExactDropdownListOptions<T extends PlayerInteractionWrapper>(this: Matchers<T>, expectedOptions: any[]): boolean;
        toHaveExactDisplayPromptCards<T extends PlayerInteractionWrapper>(this: Matchers<T>, expectedPromptState: ICardDisplaySelectionState): boolean;
        toHaveExactSelectableDisplayPromptCards<T extends PlayerInteractionWrapper>(this: Matchers<T>, expectedCardsInPrompt: Card[]): boolean;
        toHaveExactViewableDisplayPromptCards<T extends PlayerInteractionWrapper>(this: Matchers<T>, expectedCardsInPrompt: (Card | { card: Card; displayText: string })[]): boolean;
        toHaveExactDisplayPromptPerCardButtons<T extends PlayerInteractionWrapper>(this: Matchers<T>, expectedButtonsInPrompt: string[]): boolean;
        toHaveExactEnabledDisplayPromptPerCardButtons<T extends PlayerInteractionWrapper>(this: Matchers<T>, expectedButtonsInPrompt: string[]): boolean;
        toHaveExactDisabledDisplayPromptPerCardButtons<T extends PlayerInteractionWrapper>(this: Matchers<T>, expectedButtonsInPrompt: string[]): boolean;
        toBeCloneOf(card: any): boolean;
        toBeVanillaClone(): boolean;
    }
}

/**
 * Define a single spec. A spec should contain one or more expectations that test the state of the code.
 * A spec whose expectations all succeed will be passing and a spec with any failures will fail.
 * @param expectation Textual description of what this spec is checking
 * @param assertion Function that contains the code of your test. If not provided the test will be pending.
 * @param timeout Custom timeout for an async spec.
 */
declare function undoIt(expectation: string, assertion?: jasmine.ImplementationCallback, timeout?: number): void;

/**
 * Takes a snapshot, runs the assertion code, then rolls back and repeats.
 * @param context
 * @param assertion Function that contains the code of your test that will be then be rolled back and repeated to ensure rolling back works.
 * @param altAssertion If provided, will rollback after the assertions has been tested twice, to potentially test that changes have been properly undone.
 */
declare function rollback(contextRef: SwuTestContextRef, assertion: jasmine.ImplementationCallback, altAssertion?: jasmine.ImplementationCallback): void;