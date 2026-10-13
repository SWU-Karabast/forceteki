import { ModActionType } from '../../../server/services/DynamoDBInterfaces';
import type {
    IModActionStore,
    IModActionSubmission,
    IModeratorRenamer
} from '../../../server/utils/ModActionSubmissionHandler';
import { ModActionSubmissionHandler } from '../../../server/utils/ModActionSubmissionHandler';
import * as ProfanityFilterModule from '../../../server/utils/profanityFilter/ProfanityFilter';

describe('ModActionSubmissionHandler', function() {
    let store: jasmine.SpyObj<IModActionStore>;
    let renamer: jasmine.SpyObj<IModeratorRenamer>;
    let handler: ModActionSubmissionHandler;
    let callOrder: string[];

    const changeUsernameRequest = (overrides: Partial<IModActionSubmission> = {}): IModActionSubmission => ({
        playerId: 'player-1',
        actionType: ModActionType.ChangeUsername,
        moderatorId: 'mod-1',
        moderatorUsername: 'ModOne',
        note: 'approved in ticket',
        newUsername: 'ApprovedName',
        ...overrides,
    });

    const blockRequest = (overrides: Partial<IModActionSubmission> = {}): IModActionSubmission => ({
        playerId: 'player-1',
        actionType: ModActionType.UsernameChangesBlocked,
        moderatorId: 'mod-1',
        moderatorUsername: 'ModOne',
        note: 'offensive name',
        ...overrides,
    });

    beforeEach(function() {
        callOrder = [];

        store = jasmine.createSpyObj<IModActionStore>('store', ['onActionSubmitted', 'onActionCancelled', 'onRenameCompleted']);
        store.onActionSubmitted.and.callFake(() => {
            callOrder.push('submit');
            return Promise.resolve({ success: true, message: 'Action submitted.', modActionId: 'action-1' });
        });
        store.onActionCancelled.and.resolveTo();
        store.onRenameCompleted.and.callFake(() => {
            callOrder.push('resolveRename');
            return Promise.resolve();
        });

        renamer = jasmine.createSpyObj<IModeratorRenamer>('renamer', ['getUsernameAsync', 'changeUsernameByModeratorAsync']);
        renamer.getUsernameAsync.and.callFake(() => {
            callOrder.push('getUsername');
            return Promise.resolve('OldName');
        });
        renamer.changeUsernameByModeratorAsync.and.callFake(() => {
            callOrder.push('rename');
            return Promise.resolve({ success: true, previousUsername: 'OldName', historyRecorded: true });
        });

        handler = new ModActionSubmissionHandler(store, renamer);
    });

    describe('plain actions', function() {
        it('go straight to the mod action store without touching the player', async function() {
            const result = await handler.submitAsync({
                playerId: 'player-1',
                actionType: ModActionType.Warning,
                moderatorId: 'mod-1',
                moderatorUsername: 'ModOne',
                note: 'be nice',
            });

            expect(result).toEqual({ success: true, message: 'Action submitted.' });
            expect(store.onActionSubmitted).toHaveBeenCalledOnceWith('player-1', ModActionType.Warning, 'mod-1', 'ModOne', 'be nice', undefined);
            expect(renamer.getUsernameAsync).not.toHaveBeenCalled();
            expect(renamer.changeUsernameByModeratorAsync).not.toHaveBeenCalled();
        });

        it('pass a store rejection through', async function() {
            store.onActionSubmitted.and.resolveTo({ success: false, message: 'Player already has an active Mute.' });

            const result = await handler.submitAsync({
                playerId: 'player-1',
                actionType: ModActionType.Mute,
                moderatorId: 'mod-1',
                moderatorUsername: 'ModOne',
                note: 'spam',
                durationDays: 3,
            });

            expect(result).toEqual({ success: false, message: 'Player already has an active Mute.' });
        });
    });

    describe('ChangeUsername', function() {
        it('saves the audit record, then renames, then resolves a pending forced Rename', async function() {
            const result = await handler.submitAsync(changeUsernameRequest());

            expect(result).toEqual({ success: true, message: 'Username changed from \'OldName\' to \'ApprovedName\'.' });
            expect(callOrder).toEqual(['getUsername', 'submit', 'rename', 'resolveRename']);
            expect(store.onActionSubmitted).toHaveBeenCalledOnceWith('player-1', ModActionType.ChangeUsername, 'mod-1', 'ModOne', 'approved in ticket', undefined);
            expect(renamer.changeUsernameByModeratorAsync).toHaveBeenCalledOnceWith('player-1', 'ApprovedName', 'action-1');
        });

        it('rejects a name that breaks the format rules before doing any work', async function() {
            const result = await handler.submitAsync(changeUsernameRequest({ newUsername: 'has space' }));

            expect(result.success).toBeFalse();
            expect(callOrder).toEqual([]);
        });

        it('rejects a name the profanity filter flags before doing any work', async function() {
            spyOn(ProfanityFilterModule, 'userOrLobbyNameContainsProfanity').and.returnValue(true);

            const result = await handler.submitAsync(changeUsernameRequest());

            expect(result).toEqual({ success: false, message: 'Username contains inappropriate words.' });
            expect(callOrder).toEqual([]);
        });

        it('rejects an unknown player without saving anything', async function() {
            renamer.getUsernameAsync.and.resolveTo(null);

            const result = await handler.submitAsync(changeUsernameRequest());

            expect(result).toEqual({ success: false, message: 'Target player not found: player-1' });
            expect(store.onActionSubmitted).not.toHaveBeenCalled();
        });

        it('rejects the player\'s current username without saving anything', async function() {
            renamer.getUsernameAsync.and.resolveTo('ApprovedName');

            const result = await handler.submitAsync(changeUsernameRequest());

            expect(result.success).toBeFalse();
            expect(store.onActionSubmitted).not.toHaveBeenCalled();
        });

        it('does not rename when the store rejects the action', async function() {
            store.onActionSubmitted.and.resolveTo({ success: false, message: 'Mod action service is not initialized.' });

            const result = await handler.submitAsync(changeUsernameRequest());

            expect(result).toEqual({ success: false, message: 'Mod action service is not initialized.' });
            expect(renamer.changeUsernameByModeratorAsync).not.toHaveBeenCalled();
        });

        for (const [description, arrange] of [
            ['the rename is rejected', () => renamer.changeUsernameByModeratorAsync.and.resolveTo({ success: false, message: 'nope' })],
            ['the rename throws', () => renamer.changeUsernameByModeratorAsync.and.rejectWith(new Error('db down'))],
        ] as [string, () => void][]) {
            it(`cancels the audit record when ${description}, so history does not claim a rename that never happened`, async function() {
                arrange();

                const result = await handler.submitAsync(changeUsernameRequest());

                expect(result.success).toBeFalse();
                expect(result.message).toContain('The username was not changed');
                expect(store.onActionCancelled).toHaveBeenCalledOnceWith('player-1', 'action-1', 'system', 'system');
                expect(store.onRenameCompleted).not.toHaveBeenCalled();
            });
        }

        it('still reports the failure when cancelling the audit record also fails', async function() {
            renamer.changeUsernameByModeratorAsync.and.rejectWith(new Error('db down'));
            store.onActionCancelled.and.rejectWith(new Error('cancel failed'));

            const result = await handler.submitAsync(changeUsernameRequest());

            expect(result.success).toBeFalse();
        });

        it('reports a missing history entry as a failure but keeps the audit record and resolves the Rename', async function() {
            renamer.changeUsernameByModeratorAsync.and.resolveTo({ success: true, previousUsername: 'OldName', historyRecorded: false });

            const result = await handler.submitAsync(changeUsernameRequest());

            expect(result.success).toBeFalse();
            expect(result.message).toContain('history entry could not be recorded');
            expect(store.onActionCancelled).not.toHaveBeenCalled();
            expect(store.onRenameCompleted).toHaveBeenCalledOnceWith('player-1');
        });

        it('does not fail a completed rename when resolving the pending Rename fails', async function() {
            store.onRenameCompleted.and.rejectWith(new Error('resolve failed'));

            const result = await handler.submitAsync(changeUsernameRequest());

            expect(result.success).toBeTrue();
        });
    });

    describe('UsernameChangesBlocked', function() {
        it('only records the block without reading or updating the username', async function() {
            const result = await handler.submitAsync(blockRequest());

            expect(result).toEqual({ success: true, message: 'Action submitted.' });
            expect(callOrder).toEqual(['submit']);
            expect(renamer.getUsernameAsync).not.toHaveBeenCalled();
            expect(renamer.changeUsernameByModeratorAsync).not.toHaveBeenCalled();
        });

        it('passes through a rejected block without attempting a username update', async function() {
            store.onActionSubmitted.and.resolveTo({ success: false, message: 'Player already has an active UsernameChangesBlocked.' });

            const result = await handler.submitAsync(blockRequest());

            expect(result.success).toBeFalse();
            expect(renamer.getUsernameAsync).not.toHaveBeenCalled();
            expect(renamer.changeUsernameByModeratorAsync).not.toHaveBeenCalled();
        });
    });

    describe('a block followed by a standard ChangeUsername', function() {
        beforeEach(function() {
            store.onActionSubmitted.and.callFake((_playerId, actionType) => {
                callOrder.push('submit');
                return Promise.resolve({
                    success: true,
                    message: 'Action submitted.',
                    modActionId: actionType === ModActionType.UsernameChangesBlocked ? 'block-1' : 'change-1',
                });
            });
        });

        it('attributes the KarabastUser change to its own action and resolves a pending Rename', async function() {
            const blockResult = await handler.submitAsync(blockRequest());
            const changeResult = await handler.submitAsync(changeUsernameRequest({ newUsername: 'KarabastUser', note: 'offensive name' }));

            expect(blockResult.success).toBeTrue();
            expect(changeResult.success).toBeTrue();
            expect(callOrder).toEqual(['submit', 'getUsername', 'submit', 'rename', 'resolveRename']);
            expect(store.onActionSubmitted.calls.allArgs()).toEqual([
                ['player-1', ModActionType.UsernameChangesBlocked, 'mod-1', 'ModOne', 'offensive name', undefined],
                ['player-1', ModActionType.ChangeUsername, 'mod-1', 'ModOne', 'offensive name', undefined],
            ]);
            expect(renamer.changeUsernameByModeratorAsync).toHaveBeenCalledOnceWith('player-1', 'KarabastUser', 'change-1');
        });

        it('cancels only the failed username-change action, leaving the previously submitted block intact', async function() {
            const blockResult = await handler.submitAsync(blockRequest());
            renamer.changeUsernameByModeratorAsync.and.rejectWith(new Error('db down'));

            const changeResult = await handler.submitAsync(changeUsernameRequest({ newUsername: 'KarabastUser' }));

            expect(blockResult.success).toBeTrue();
            expect(changeResult.success).toBeFalse();
            expect(changeResult.message).toContain('The username was not changed');
            expect(store.onActionCancelled).toHaveBeenCalledOnceWith('player-1', 'change-1', 'system', 'system');
            expect(store.onRenameCompleted).not.toHaveBeenCalled();
        });

        it('reports missing username history without undoing either successful operation', async function() {
            const blockResult = await handler.submitAsync(blockRequest());
            renamer.changeUsernameByModeratorAsync.and.resolveTo({ success: true, previousUsername: 'OldName', historyRecorded: false });

            const changeResult = await handler.submitAsync(changeUsernameRequest({ newUsername: 'KarabastUser' }));

            expect(blockResult.success).toBeTrue();
            expect(changeResult.success).toBeFalse();
            expect(changeResult.message).toContain('history entry could not be recorded');
            expect(store.onActionCancelled).not.toHaveBeenCalled();
            expect(store.onRenameCompleted).toHaveBeenCalledOnceWith('player-1');
        });
    });
});
