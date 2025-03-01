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

declare let integration: (definitions: ((contextRef: SwuTestContextRef) => void) | (() => void)) => void;

interface SwuTestContextRef {
    context: SwuTestContext;
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

    allowTestToEndWithOpenPrompt: boolean;

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
    skipSetupPhase();
    startGameAsync(): Promise;

    // To account for any dynamically added cards or objects, we have a free-form accessor.
    [field: string]: any;
}

interface PlayerInfo {
    id: string;
    username: string;
}

interface SwuSetupTestOptions {
    phase?: string;
    player1?: SwuPlayerSetupOptions;
    player2?: SwuPlayerSetupOptions;
    autoSingleTarget?: boolean;
    phaseTransitionHandler?: (phase: PhaseName) => void;

    [field: string]: any;
}

interface SwuPlayerSetupOptions {
    groundArena?: any[];
    spaceArena?: any[];
    hand?: any[];
    discard?: any[];
    leader?: any;
    base?: any;
    hasInitiative?: boolean;

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
        toHaveChooseNoTargetButton<T extends PlayerInteractionWrapper>(this: Matchers<T>): boolean;
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
        toHaveExactUpgradeNames(upgradeNames: any[]): boolean;
        toHaveExactPromptButtons<T extends PlayerInteractionWrapper>(this: Matchers<T>, buttons: any[]): boolean;
        toHaveExactDropdownListOptions<T extends PlayerInteractionWrapper>(this: Matchers<T>, expectedOptions: any[]): boolean;
        toHaveExactDisplayPromptCards<T extends PlayerInteractionWrapper>(this: Matchers<T>, expectedPromptState: ICardDisplaySelectionState): boolean;
        toHaveExactSelectableDisplayPromptCards<T extends PlayerInteractionWrapper>(this: Matchers<T>, expectedCardsInPrompt: Card[]): boolean;
        toHaveExactViewableDisplayPromptCards<T extends PlayerInteractionWrapper>(this: Matchers<T>, expectedCardsInPrompt: (Card | { card: Card; displayText: string })[]): boolean;
        toHaveExactDisplayPromptPerCardButtons<T extends PlayerInteractionWrapper>(this: Matchers<T>, expectedButtonsInPrompt: string[]): boolean;
        toHaveExactEnabledDisplayPromptPerCardButtons<T extends PlayerInteractionWrapper>(this: Matchers<T>, expectedButtonsInPrompt: string[]): boolean;
        toHaveExactDisabledDisplayPromptPerCardButtons<T extends PlayerInteractionWrapper>(this: Matchers<T>, expectedButtonsInPrompt: string[]): boolean;
    }
}