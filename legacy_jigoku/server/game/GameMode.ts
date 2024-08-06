import type { AbilityContext } from './AbilityContext';
import type { CardAction } from './CardAction';
import { AbilityTypes, Locations, Phases } from './Constants';
import type BaseCard from './basecard';
import type { ProvinceCard } from './ProvinceCard';

type RingChoices = Record<string, (context: AbilityContext) => boolean>;

export const AIR_CHOICE = {
    GAIN_2: 'Gain 2 Honor',
    TAKE_1: 'Take 1 Honor from opponent',
    SKIP: "Don't resolve"
} as const;

export const EARTH_CHOICE = {
    DRAW: 'Draw a card',
    FORCE_DISCARD: 'Opponent discards a card',
    DRAW_AND_FORCE_DISCARD: 'Draw a card and opponent discards',
    SKIP: "Don't resolve"
} as const;

export interface GameMode {
    name: string;
    attachmentsMaxOneCopyPerName: boolean;
    conflictHaveUnopposedHonorLoss: boolean;
    conflictOneFewerOpportunity: boolean;
    covertUnified: boolean;
    deckoutHonorLoss: number;
    disguiseKeepsCharactersInSameLocation: boolean;
    duelRules: 'currentSkill' | 'printedSkill' | 'skirmish';
    dynastyPhaseCanPlayAttachments: boolean;
    dynastyPhaseCanPlayConflictEvents: (action: CardAction) => boolean;
    dynastyPhaseCanPlayConflictCharacters: boolean;
    dynastyPhaseForcedFatePerRound?: number;
    dynastyPhasePassingFate: boolean;
    dynastyPhaseActionsFromCardsInPlay: boolean;
    fatePerRoundForced?: number;
    fatePhaseForceDiscardFromBrokenProvinces: boolean;
    fatePhasePutFateOnRings: boolean;
    honorBidValues: string[];
    imperialFavorHasSides: boolean;
    rallyHasEffect: boolean;
    ringAirChoices: (optional: boolean) => RingChoices;
    ringEarthChoices: (optional: boolean) => RingChoices;
    ringWaterTargetCondition: (card: BaseCard, context: AbilityContext) => boolean;
    setupFixedStartingHonor?: number;
    setupHaveProvinceCards: boolean;
    setupHaveRoles: boolean;
    setupHaveStrongholds: boolean;
    setupNonStrongholdProvinces: Locations[];
    setupStartingHandSize: number;
    winConReachedConquestVictory: (provinceBeingBroken: ProvinceCard) => boolean;
    winConRequiredHonorForWin: number;
}

const Stronghold: GameMode = {
    name: 'stronghold',
    attachmentsMaxOneCopyPerName: false,
    conflictHaveUnopposedHonorLoss: true,
    conflictOneFewerOpportunity: false,
    covertUnified: false,
    deckoutHonorLoss: 5,
    disguiseKeepsCharactersInSameLocation: false,
    duelRules: 'currentSkill',
    dynastyPhaseActionsFromCardsInPlay: true,
    dynastyPhaseCanPlayAttachments: false,
    dynastyPhaseCanPlayConflictCharacters: false,
    dynastyPhaseCanPlayConflictEvents: () => true,
    dynastyPhaseForcedFatePerRound: undefined,
    dynastyPhasePassingFate: true,
    fatePerRoundForced: undefined,
    fatePhaseForceDiscardFromBrokenProvinces: true,
    fatePhasePutFateOnRings: true,
    honorBidValues: ['1', '2', '3', '4', '5'],
    imperialFavorHasSides: true,
    rallyHasEffect: true,
    setupFixedStartingHonor: undefined,
    setupHaveProvinceCards: true,
    setupHaveRoles: true,
    setupHaveStrongholds: true,
    setupNonStrongholdProvinces: [
        Locations.ProvinceOne,
        Locations.ProvinceTwo,
        Locations.ProvinceThree,
        Locations.ProvinceFour
    ],
    setupStartingHandSize: 4,
    ringAirChoices: (optional: boolean): RingChoices => ({
        [AIR_CHOICE.GAIN_2]: () => true,
        [AIR_CHOICE.TAKE_1]: (context: AbilityContext) =>
            context.player.opponent && context.player.opponent.checkRestrictions('takeHonor', context),
        [AIR_CHOICE.SKIP]: () => optional
    }),
    ringEarthChoices: (optional: boolean): RingChoices => ({
        [EARTH_CHOICE.DRAW_AND_FORCE_DISCARD]: () => true,
        [EARTH_CHOICE.SKIP]: () => optional
    }),
    ringWaterTargetCondition: (card: BaseCard, context: AbilityContext) =>
        card.location === Locations.PlayArea &&
        (card.bowed || (card.getFate() === 0 && card.allowGameAction('bow', context))),
    winConReachedConquestVictory: (provinceBeingBroken: ProvinceCard) =>
        provinceBeingBroken.location === Locations.StrongholdProvince,
    winConRequiredHonorForWin: 25
};

const Skirmish: GameMode = {
    ...Stronghold,
    name: 'skirmish',

    conflictHaveUnopposedHonorLoss: false,
    conflictOneFewerOpportunity: true,
    deckoutHonorLoss: 3,
    duelRules: 'skirmish',
    dynastyPhaseCanPlayConflictEvents: () => false,
    dynastyPhaseForcedFatePerRound: 6,
    dynastyPhasePassingFate: false,
    fatePerRoundForced: 6,
    fatePhaseForceDiscardFromBrokenProvinces: false,
    fatePhasePutFateOnRings: false,
    honorBidValues: ['1', '2', '3'],
    imperialFavorHasSides: false,
    setupFixedStartingHonor: 6,
    setupHaveProvinceCards: false,
    setupHaveRoles: false,
    setupHaveStrongholds: false,
    setupNonStrongholdProvinces: [Locations.ProvinceOne, Locations.ProvinceTwo, Locations.ProvinceThree],
    setupStartingHandSize: 3,
    ringAirChoices: (optional: boolean): RingChoices => ({
        [AIR_CHOICE.TAKE_1]: (context: AbilityContext) =>
            context.player.opponent && context.player.opponent.checkRestrictions('takeHonor', context),
        [AIR_CHOICE.SKIP]: () => optional
    }),
    ringEarthChoices: (optional: boolean): RingChoices => ({
        [EARTH_CHOICE.DRAW]: () => true,
        [EARTH_CHOICE.FORCE_DISCARD]: (context: AbilityContext) => Boolean(context.player.opponent),
        [EARTH_CHOICE.SKIP]: () => optional
    }),
    ringWaterTargetCondition: (card: BaseCard, context: AbilityContext) =>
        card.location === Locations.PlayArea &&
        card.getFate() <= 1 &&
        !card.isParticipating() &&
        ((card.ready && card.allowGameAction('bow', context)) ||
            (card.bowed && card.allowGameAction('ready', context))),
    winConReachedConquestVictory: (provinceBeingBroken: ProvinceCard) =>
        provinceBeingBroken.controller.getProvinces((card: ProvinceCard) => card.isBroken).length > 2,
    winConRequiredHonorForWin: 12
};

const JadeEdict: GameMode = {
    ...Stronghold,
    name: 'jade-edict',

    rallyHasEffect: false
};
const Emerald: GameMode = {
    ...Stronghold,
    name: 'emerald',

    attachmentsMaxOneCopyPerName: true,
    covertUnified: true,
    disguiseKeepsCharactersInSameLocation: true,
    duelRules: 'printedSkill',
    dynastyPhaseCanPlayAttachments: false,
    dynastyPhaseCanPlayConflictEvents: (action) =>
        action.abilityType !== AbilityTypes.Action ||
        action.phase === Phases.Dynasty ||
        (action.card as BaseCard).isDynasty,
    dynastyPhaseCanPlayConflictCharacters: false,
    dynastyPhasePassingFate: false,
    dynastyPhaseActionsFromCardsInPlay: false
};
const Obsidian: GameMode = {
    ...Stronghold,
    name: 'obsidian',

    attachmentsMaxOneCopyPerName: true,
    disguiseKeepsCharactersInSameLocation: true,
    dynastyPhaseCanPlayAttachments: true,
    dynastyPhaseCanPlayConflictCharacters: true
};

export function parseGameMode(candidateStr: string): GameMode {
    switch (candidateStr) {
        case 'skirmish':
            return Skirmish;
        case 'jade-edict':
            return JadeEdict;
        case 'emerald':
            return Emerald;
        case 'obsidian':
            return Obsidian;
        default:
            return Stronghold;
    }
}
