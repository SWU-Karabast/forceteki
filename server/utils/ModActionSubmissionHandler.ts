import { logger } from '../logger';
import { Contract } from '../game/core/utils/Contract';
import type { ModActionType } from '../services/DynamoDBInterfaces';
import { ModActionDefinitions } from '../services/DynamoDBInterfaces';
import { userOrLobbyNameContainsProfanity } from './profanityFilter/ProfanityFilter';
import { validateUsernameFormat } from './user/UsernameRules';

export interface IModActionSubmission {
    playerId: string;
    actionType: ModActionType;
    moderatorId: string;
    moderatorUsername: string;
    note: string;
    durationDays?: number;
    newUsername?: string;
}

export interface IModActionSubmissionResult {
    success: boolean;
    message: string;
}

/** The part of ModActionService the handler depends on. */
export interface IModActionStore {
    onActionSubmitted(
        playerId: string,
        actionType: ModActionType,
        moderatorId: string,
        moderatorUsername: string,
        note: string,
        durationDays?: number
    ): Promise<{ success: boolean; message: string; modActionId?: string }>;
    onActionCancelled(playerId: string, modActionId: string, cancelledById: string, cancelledByUsername: string): Promise<void>;
    onRenameCompleted(playerId: string): Promise<void>;
}

/** The part of UserFactory the handler depends on. */
export interface IModeratorRenamer {
    getUsernameAsync(userId: string): Promise<string | null>;
    changeUsernameByModeratorAsync(userId: string, newUsername: string, relatedModActionId: string): Promise<{
        success: boolean;
        previousUsername?: string;
        historyRecorded?: boolean;
        message?: string;
    }>;
}

interface IRenameOutcome {
    renamed: boolean;
    failure?: string;
    previousUsername?: string;
    historyRecorded?: boolean;
}

/**
 * Entry point for every moderator action submission. Plain actions go straight to the mod action store;
 * ChangeUsername actions run here because they span the mod action store and the user profile.
 *
 * Ordering for those: validate everything first (no writes), then save the audit record, then rename.
 * The audit record comes first so a moderator's change is never unattributed.
 */
export class ModActionSubmissionHandler {
    private readonly modActions: IModActionStore;
    private readonly renamer: IModeratorRenamer;

    public constructor(modActions: IModActionStore, renamer: IModeratorRenamer) {
        this.modActions = modActions;
        this.renamer = renamer;
    }

    public async submitAsync(request: IModActionSubmission): Promise<IModActionSubmissionResult> {
        const definition = ModActionDefinitions[request.actionType];

        if (definition.requiresNewUsername) {
            return await this.submitChangeUsernameAsync(request);
        }

        const result = await this.submitAuditRecordAsync(request);
        return { success: result.success, message: result.message };
    }

    private async submitChangeUsernameAsync(request: IModActionSubmission): Promise<IModActionSubmissionResult> {
        const newUsername = request.newUsername;
        const validationError = validateUsernameFormat(newUsername) ??
          (userOrLobbyNameContainsProfanity(newUsername) ? 'Username contains inappropriate words.' : null);
        if (validationError) {
            return { success: false, message: validationError };
        }

        const currentUsername = await this.renamer.getUsernameAsync(request.playerId);
        if (currentUsername === null) {
            return { success: false, message: `Target player not found: ${request.playerId}` };
        }
        if (currentUsername === newUsername) {
            return { success: false, message: `The player's username is already '${newUsername}'.` };
        }

        const submitResult = await this.submitAuditRecordAsync(request);
        if (!submitResult.success) {
            return { success: false, message: submitResult.message };
        }

        const outcome = await this.renameAsync(request, submitResult.modActionId, newUsername);
        if (!outcome.renamed) {
            await this.cancelAuditRecordAsync(request.playerId, submitResult.modActionId);
            return { success: false, message: `The username was not changed: ${outcome.failure}.` };
        }
        if (!outcome.historyRecorded) {
            return { success: false, message: this.missingHistoryMessage(outcome.previousUsername, newUsername) };
        }

        return { success: true, message: `Username changed from '${outcome.previousUsername}' to '${newUsername}'.` };
    }

    private async submitAuditRecordAsync(request: IModActionSubmission): Promise<{ success: boolean; message: string; modActionId?: string }> {
        const result = await this.modActions.onActionSubmitted(
            request.playerId,
            request.actionType,
            request.moderatorId,
            request.moderatorUsername,
            request.note,
            request.durationDays,
        );

        if (result.success) {
            Contract.assertNotNullLike(result.modActionId, `Mod action store did not return an id for ${request.actionType}`);
        }
        return result;
    }

    private async renameAsync(request: IModActionSubmission, modActionId: string, newUsername: string): Promise<IRenameOutcome> {
        let result: Awaited<ReturnType<IModeratorRenamer['changeUsernameByModeratorAsync']>>;
        try {
            result = await this.renamer.changeUsernameByModeratorAsync(request.playerId, newUsername, modActionId);
        } catch (error) {
            logger.error(`ModActionSubmissionHandler: rename of ${request.playerId} to ${newUsername} failed (action ${modActionId})`, {
                error: { message: error.message, stack: error.stack },
                userId: request.playerId,
                moderatorId: request.moderatorId,
            });
            return { renamed: false, failure: 'an error occurred while saving the new username' };
        }

        if (!result.success) {
            return { renamed: false, failure: result.message ?? 'the rename was rejected' };
        }

        logger.info(`ModActionSubmissionHandler: moderator ${request.moderatorId} changed username of ${request.playerId} from '${result.previousUsername}' to '${newUsername}' (action ${modActionId})`, {
            userId: request.playerId,
            moderatorId: request.moderatorId,
            modActionId,
        });

        // A username set by a moderator satisfies a pending forced Rename
        try {
            await this.modActions.onRenameCompleted(request.playerId);
        } catch (error) {
            logger.error(`ModActionSubmissionHandler: failed to resolve the pending Rename for ${request.playerId}`, {
                error: { message: error.message, stack: error.stack },
                userId: request.playerId,
            });
        }

        return { renamed: true, previousUsername: result.previousUsername, historyRecorded: result.historyRecorded };
    }

    private async cancelAuditRecordAsync(playerId: string, modActionId: string): Promise<void> {
        try {
            await this.modActions.onActionCancelled(playerId, modActionId, 'system', 'system');
        } catch (error) {
            logger.error(`ModActionSubmissionHandler: failed to cancel action ${modActionId} after its rename failed`, {
                error: { message: error.message, stack: error.stack },
                userId: playerId,
            });
        }
    }

    private missingHistoryMessage(previousUsername: string, newUsername: string): string {
        return `The username was changed from '${previousUsername}' to '${newUsername}', but its history entry could not be recorded (see server logs).`;
    }
}
