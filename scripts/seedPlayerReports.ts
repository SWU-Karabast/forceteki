/**
 * Seed script for filling local DynamoDB with player reports, to try out the report dashboard in the mod tools
 * (paging, search, filters, open/closed tickets, a repeat offender with an earlier mod action).
 *
 * It creates REPORT_COUNT reports between PLAYERS spread over the last few weeks, closes most of the older ones,
 * and gives the local dev user Order66 (exe66) the Moderator role so the mod page is reachable without seedAdmin.
 * Reports go through PlayerReportService, so the records, logs and per-player index entries look exactly like
 * ones filed from a game. Running it again adds another batch.
 *
 * Prerequisites:
 *   - ENVIRONMENT=development and USE_LOCAL_DYNAMODB=true in your env
 *   - Local DynamoDB Docker container ( by "running docker-compose up -d" )
 * Usage:
 *   1. Adjust REPORT_COUNT / GRANT_MODERATOR_TO_ORDER66 as needed
 *   2. From the root of the project run: ts-node scripts/seedPlayerReports.ts
 *   3. Restart the game server if it is running: it caches the report list and only reloads it every 10 minutes
 *
 * Note: GRANT_MODERATOR_TO_ORDER66 overwrites the stored server roles (like seedAdmin.ts does).
 */

import '../server/env';
import { getDynamoDbServiceAsync } from '../server/services/DynamoDBService';
import { ModActionType, PlayerReportOutcome } from '../server/services/DynamoDBInterfaces';
import { PlayerReportType, type ISerializedMessage } from '../server/game/Interfaces';
import type { IScheduler } from '../server/utils/IScheduler';
import { PlayerReportService, type IReportParticipant } from '../server/utils/PlayerReportService';
import { UserFactory } from '../server/utils/user/UserFactory';

const REPORT_COUNT = 40;
const GRANT_MODERATOR_TO_ORDER66 = true;

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Time between two seeded reports; 40 reports span about three weeks */
const REPORT_SPACING_MS = 14 * HOUR;

/** Reports at least this many places from the newest are mostly closed already */
const OPEN_RECENT_REPORTS = 8;

const PLAYERS: IReportParticipant[] = [
    'Vader66', 'LukeFan', 'Grogu', 'BobaFett', 'LeiaOrgana', 'Ahsoka', 'Thrawn', 'CaptainRex', 'Hondo', 'Jabba',
].map((username, i) => ({ id: `seed-player-${i}`, username }));

const SEED_MODERATOR = { id: 'seed-mod', username: 'ModAlice' };

/** Names the reported player had at report time for Offensive Username reports */
const OFFENSIVE_NAMES = ['Xx_ToxicSith_xX', 'RebelScumHater', 'KillAllRebels'];

type LogScript = (reporter: IReportParticipant, reported: IReportParticipant) => [IReportParticipant, string][];

interface IScenario {
    offense: PlayerReportType;
    descriptions: string[];
    chat: LogScript;
    game: LogScript;
    undoSteps: number;
    offensiveName?: boolean;
}

// One scenario per PlayerReportType. Abusing Karabast Features and Other require a description in the client
// dialog; the other two may come without one.
const SCENARIOS: IScenario[] = [
    {
        offense: PlayerReportType.ChatHarrasment,
        descriptions: ['Kept insulting me the whole game after I took the initiative.', '', 'Threatened me in chat after I won game 2.'],
        chat: (r, o) => [[r, 'gl hf'], [o, 'you are trash at this game'], [r, 'please stop'], [o, 'uninstall and never come back']],
        game: (r, o) => [[r, 'plays Wampa'], [o, 'attacks with Darth Vader'], [r, 'takes the initiative'], [o, 'deals 5 damage to the base']],
        undoSteps: 2,
    },
    {
        offense: PlayerReportType.OffensiveUsername,
        descriptions: ['', 'The username is a slur.', ''],
        chat: (r, o) => [[r, 'gl hf'], [o, 'gl']],
        game: (r, o) => [[r, 'plays Battlefield Marine'], [o, 'plays Boba Fett'], [r, 'passes']],
        undoSteps: 1,
        offensiveName: true,
    },
    {
        offense: PlayerReportType.AbusingMechanics,
        descriptions: [
            'Let the turn timer run out on every single action to stall the game until I conceded.',
            'Used undo over and over to look at my hand reactions, about 20 undos in one round.',
        ],
        chat: (r, o) => [[r, 'can you please play?'], [o, 'no']],
        game: (r, o) => [[o, 'ran out of time and passed'], [o, 'ran out of time and passed'], [o, 'undid their last action'], [o, 'undid their last action'], [r, 'concedes']],
        undoSteps: 47,
    },
    {
        offense: PlayerReportType.Other,
        descriptions: ['Opponent left right after the game started and joined again to farm wins, this happened three times today.'],
        chat: (r, o) => [[o, 'brb'], [r, 'you again?']],
        game: (r, o) => [[o, 'disconnected'], [o, 'reconnected'], [r, 'plays Leia Organa']],
        undoSteps: 0,
    },
];

const GAME_FORMATS = ['premier', 'premier', 'open', 'eternal', 'fauxSuns'];
const MATCH_TYPES = ['quick', 'publicLobby', 'quick', 'privateLobby'];
const CLOSED_OUTCOMES = [PlayerReportOutcome.NoAction, PlayerReportOutcome.ActionTaken, PlayerReportOutcome.FalseReport];

/** Lets each report be created and closed at a past time instead of now */
class SeedClock implements IScheduler {
    public time = Date.now();

    public now() {
        return this.time;
    }

    public currentDate() {
        return new Date(this.time);
    }

    // The report service only schedules its retention cleanup, which the seed script never runs
    public setTimeout() {
        return { cancel: () => undefined };
    }

    public setInterval() {
        return { cancel: () => undefined };
    }
}

// Real game messages carry player markers as objects, which MessageText does not model
function message(parts: unknown[], at: number): ISerializedMessage {
    return { date: new Date(at), message: parts as ISerializedMessage['message'] };
}

function chatLine(speaker: IReportParticipant, text: string, at: number) {
    return message([{ type: 'playerChat', id: speaker.id, name: speaker.username }, ' ', text], at);
}

function gameLine(player: IReportParticipant, text: string, at: number) {
    return message([{ id: player.id, name: player.username }, ` ${text}`], at);
}

function pickReportedPlayer(index: number, reporter: IReportParticipant, scenario: IScenario): IReportParticipant {
    let reported = PLAYERS[(index * 3 + 1) % PLAYERS.length];
    if (reported.id === reporter.id) {
        reported = PLAYERS[(index + 1) % PLAYERS.length];
    }
    return scenario.offensiveName
        ? { ...reported, username: OFFENSIVE_NAMES[index % OFFENSIVE_NAMES.length] }
        : reported;
}

async function run() {
    if (process.env.ENVIRONMENT !== 'development' || process.env.USE_LOCAL_DYNAMODB !== 'true') {
        throw new Error('Environmental variables ENVIRONMENT and USE_LOCAL_DYNAMODB need to be set.');
    }

    const service = await getDynamoDbServiceAsync();
    if (!service) {
        throw new Error('DynamoDB service not available (are you in dev & DynamoDB Local running?)');
    }

    const userFactory = new UserFactory();
    await userFactory.ensureDevelopmentTestUsersAsync();

    if (GRANT_MODERATOR_TO_ORDER66) {
        await service.putItemAsync({ pk: 'SERVER_ROLE_USERS', sk: 'ROLES' }, {
            admins: [],
            developers: [],
            moderators: [{ id: 'exe66', note: 'Local test moderator (Order66)' }],
            contributors: [],
            updatedAt: new Date().toISOString(),
        });
    }

    const seedStart = Date.now();
    for (const player of PLAYERS) {
        const createdAt = new Date(seedStart - 200 * DAY).toISOString();
        await service.saveUserProfileAsync({
            id: player.id,
            username: player.username,
            lastLogin: new Date(seedStart - DAY).toISOString(),
            createdAt,
            usernameLastUpdatedAt: createdAt,
            showWelcomeMessage: false,
            needsUsernameChange: false,
            preferences: {},
        });
        await service.saveUsernameLinkAsync(player.username, player.id);
    }

    const clock = new SeedClock();
    const reportService = new PlayerReportService(userFactory, () => undefined, clock);
    const reportIds: string[] = [];

    // Oldest first, so createdAt and the per-player prior report counts line up with the order of filing
    for (let i = REPORT_COUNT - 1; i >= 0; i--) {
        clock.time = seedStart - i * REPORT_SPACING_MS - (i % 5) * 37 * MINUTE;
        const scenario = SCENARIOS[i % SCENARIOS.length];
        const reporter = PLAYERS[i % PLAYERS.length];
        const reported = pickReportedPlayer(i, reporter, scenario);

        const gameStart = clock.time - 25 * MINUTE;
        const report = await reportService.createReportAsync({
            reporter,
            reportedPlayer: reported,
            offense: scenario.offense,
            description: scenario.descriptions[i % scenario.descriptions.length],
            lobbyId: `local-lobby-${i}`,
            gameId: String(5000 + i),
            gameFormat: GAME_FORMATS[i % GAME_FORMATS.length],
            matchType: MATCH_TYPES[i % MATCH_TYPES.length],
            gameStepsSinceLastUndo: scenario.undoSteps,
            gameMessages: scenario.game(reporter, reported).map(([player, text], line) => gameLine(player, text, gameStart + line * 4 * MINUTE)),
            chatMessages: scenario.chat(reporter, reported).map(([player, text], line) => chatLine(player, text, gameStart + line * 4 * MINUTE + 30_000)),
        });
        reportIds.push(report.id);

        if (i > OPEN_RECENT_REPORTS && i % 4 !== 0) {
            clock.time += 3 * HOUR;
            const outcome = scenario.offense === PlayerReportType.Other
                ? PlayerReportOutcome.NoAction
                : CLOSED_OUTCOMES[i % CLOSED_OUTCOMES.length];
            await reportService.closeReportAsync(report.id, outcome, i % 2 ? 'Checked the chat and game log.' : undefined, SEED_MODERATOR);
        }
    }

    // An earlier warning against a repeat offender, so the player's history has something to show
    if (reportIds.length > 5) {
        await service.saveModActionAsync({
            id: `seed-action-${seedStart}`,
            playerId: PLAYERS[1].id,
            actionType: ModActionType.Warning,
            note: 'Insulting the opponent in chat.',
            moderatorId: SEED_MODERATOR.id,
            moderatorUsername: SEED_MODERATOR.username,
            createdAt: new Date(seedStart - 20 * DAY).toISOString(),
            relatedReportId: reportIds[5],
        });
    }

    const openCount = await reportService.getOpenReportCountAsync();
    console.log(`Seeded ${PLAYERS.length} players and ${reportIds.length} reports (${openCount} open in total)` +
      (GRANT_MODERATOR_TO_ORDER66 ? ', Moderator role for Order66 (exe66)' : ''));
}

run().then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
