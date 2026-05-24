import { z, type ZodIssue } from 'zod';
import { TOKEN_NAMES, type IGameStateValidationError } from './GameStateFormatTypes';

// ──────────────────────────────────────────────────────────────────────────────
// Card identifier schemas
//
// A CardId is either:
//   (a) A token name from the fixed TOKEN_NAMES enum, or
//   (b) A set-code string matching the pattern <SET>_<NUMBER>[<SUFFIX>]
//       e.g. "SOR_001", "JTL_042b", "ASH_209"
//
// Token names are checked first in the union so that slugs like "shield"
// don't accidentally fail the set-code regex and surface a confusing error.
// ──────────────────────────────────────────────────────────────────────────────

const TokenNameSchema = z.enum(TOKEN_NAMES);

/** Accepts only the literal integers 1 or 2 (player numbers). */
const PlayerNumberSchema = z.union([z.literal(1), z.literal(2)]);

const SetCodeSchema = z
    .string()
    .regex(
        /^[A-Z0-9]{2,5}_\d+[a-zA-Z]?$/,
        'Must be a set-code string (e.g. "SOR_001") or a known token name'
    );

/**
 * Validates any CardId: a known token slug or a set-code string.
 * Error messages from this schema point to the first branch that is "closest"
 * — zod will surface the set-code regex message for unknown strings.
 */
const CardIdSchema = z.union([TokenNameSchema, SetCodeSchema]);

// ── Upgrade ───────────────────────────────────────────────────────────────────

const ExportedUpgradeStateSchema = z
    .object({
        card: CardIdSchema,
        owner: PlayerNumberSchema.optional(),
        controller: PlayerNumberSchema.optional(),
    })
    .strict();

const UpgradeEntrySchema = z.union([CardIdSchema, ExportedUpgradeStateSchema]);

// ── Captured units ────────────────────────────────────────────────────────────

const ExportedCapturedCardStateSchema = z
    .object({
        card: CardIdSchema,
        owner: PlayerNumberSchema,
    })
    .strict();

const CapturedEntrySchema = z.union([CardIdSchema, ExportedCapturedCardStateSchema]);

// ── In-play card ──────────────────────────────────────────────────────────────

const ExportedCardStateSchema = z
    .object({
        card: CardIdSchema,
        damage: z.number()
            .int()
            .nonnegative()
            .optional(),
        exhausted: z.boolean().optional(),
        upgrades: z.array(UpgradeEntrySchema).optional(),
        capturedUnits: z.array(CapturedEntrySchema).optional(),
        owner: PlayerNumberSchema.optional(),
    })
    .strict();

const CardEntrySchema = z.union([CardIdSchema, ExportedCardStateSchema]);

// ── Leader ────────────────────────────────────────────────────────────────────

const ExportedLeaderStateSchema = z
    .object({
        card: CardIdSchema,
        deployed: z.boolean().optional(),
        damage: z.number()
            .int()
            .nonnegative()
            .optional(),
        exhausted: z.boolean().optional(),
        upgrades: z.array(UpgradeEntrySchema).optional(),
        capturedUnits: z.array(CapturedEntrySchema).optional(),
        flipped: z.boolean().optional(),
        epicActionSpent: z.boolean().optional(),
    })
    .strict()
    .superRefine((leader, ctx) => {
        if (leader.deployed === false) {
            if (typeof leader.damage === 'number' && leader.damage > 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['damage'],
                    message: 'Leader cannot have damage when not deployed',
                });
            }
            if (Array.isArray(leader.upgrades) && leader.upgrades.length > 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['upgrades'],
                    message: 'Leader cannot have upgrades when not deployed',
                });
            }
        }
    });

// ── Base ──────────────────────────────────────────────────────────────────────

const ExportedBaseStateSchema = z
    .object({
        card: CardIdSchema,
        damage: z.number()
            .int()
            .nonnegative()
            .optional(),
        epicActionSpent: z.boolean().optional(),
    })
    .strict();

// ── Resources ─────────────────────────────────────────────────────────────────

const ExportedResourceStateSchema = z
    .object({
        card: CardIdSchema,
        exhausted: z.boolean().optional(),
    })
    .strict();

const ResourceEntrySchema = z.union([CardIdSchema, ExportedResourceStateSchema]);

// ── Player state ──────────────────────────────────────────────────────────────

const ExportedPlayerStateSchema = z
    .object({
        hand: z.array(CardIdSchema).optional(),
        groundArena: z.array(CardEntrySchema).optional(),
        spaceArena: z.array(CardEntrySchema).optional(),
        discard: z.array(CardIdSchema).optional(),
        deck: z.array(CardIdSchema).optional(),
        resources: z
            .union([z.number()
                .int()
                .nonnegative(), z.array(ResourceEntrySchema)])
            .optional(),
        base: z.union([CardIdSchema, ExportedBaseStateSchema]),
        leader: z.union([CardIdSchema, ExportedLeaderStateSchema]),
        hasInitiative: z.boolean().optional(),
        hasForceToken: z.boolean().optional(),
        credits: z.number()
            .int()
            .nonnegative()
            .optional(),
    })
    .strict();

// ── Top-level game state ──────────────────────────────────────────────────────

/**
 * The root Zod schema for `IExportedGameState`. Exported so that callers can
 * compose it (e.g. in an API request body validator) without going through the
 * `validateGameState` helper.
 */
export const ExportedGameStateSchema = z
    .object({
        phase: z.string().optional(),
        round: z.number().int().positive().optional(),
        actionNumber: z.number().int().positive().optional(),
        player1: ExportedPlayerStateSchema,
        player2: ExportedPlayerStateSchema,
    })
    .strict()
    .superRefine((state, ctx) => {
        if (state.player1.hasInitiative && state.player2.hasInitiative) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['hasInitiative'],
                message: 'Only one player can have initiative',
            });
        }
    });

// ── Game history ──────────────────────────────────────────────────────────────

const ACTION_TYPES = [
    'playCard',
    'attack',
    'useAbility',
    'pass',
    'claimInitiative',
    'resource',
    'mulligan',
    'keepHand',
    'concede',
    'phaseStart',
] as const;

const ActionSummarySchema = z
    .object({
        type: z.enum(ACTION_TYPES),
        actingPlayer: PlayerNumberSchema.optional(),
        sourceCard: CardIdSchema.optional(),
        targetCard: CardIdSchema.optional(),
    })
    .strict()
    .superRefine((action, ctx) => {
        if (action.type === 'phaseStart' && action.actingPlayer !== undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['actingPlayer'],
                message: 'phaseStart actions are engine-driven and must not have an actingPlayer',
            });
        }
        if (action.type !== 'phaseStart' && action.actingPlayer === undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['actingPlayer'],
                message: 'Player-initiated actions must have an actingPlayer',
            });
        }
    });

const GameHistoryActionSchema = z
    .object({
        seq: z.number().int().positive(),
        round: z.number().int().positive(),
        action: ActionSummarySchema.optional(),
        state: ExportedGameStateSchema,
    })
    .strict();

const GameEndReasonSchema = z.enum(['baseDestroyed', 'concede', 'timeout']);

const GameResultSchema = z
    .object({
        winner: PlayerNumberSchema,
        reason: GameEndReasonSchema,
    })
    .strict();

export const GameHistorySchema = z
    .object({
        entries: z.array(GameHistoryActionSchema),
        result: GameResultSchema.optional(),
    })
    .strict();

// ── Error formatting ──────────────────────────────────────────────────────────

/** Converts a Zod issue into the project's `IGameStateValidationError` shape. */
export function zodIssueToValidationError(issue: ZodIssue): IGameStateValidationError {
    return {
        path: formatZodPath(issue.path),
        message: issue.message,
    };
}

/**
 * Formats a Zod path array into a human-readable dot/bracket string,
 * e.g. `['player1', 'groundArena', 2, 'card']` → `"player1.groundArena[2].card"`.
 */
function formatZodPath(parts: (string | number)[]): string {
    let out = '';
    for (const part of parts) {
        if (typeof part === 'number') {
            out += `[${part}]`;
        } else if (out === '') {
            out = part;
        } else {
            out += `.${part}`;
        }
    }
    return out;
}
