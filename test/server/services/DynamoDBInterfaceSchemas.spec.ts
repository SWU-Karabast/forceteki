import { ModActionType } from '../../../server/services/DynamoDBInterfaces';
import { ModActionSubmitSchema } from '../../../server/services/DynamoDBInterfaceSchemas';

describe('ModActionSubmitSchema', function() {
    const base = { playerId: 'player-1', note: 'because' };

    // Returns the paths of every validation issue, so each case can assert which field it blames
    const issuePaths = (body: unknown): string[] => {
        const result = ModActionSubmitSchema.safeParse(body);
        return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));
    };
    const issueMessages = (body: unknown): string[] => {
        const result = ModActionSubmitSchema.safeParse(body);
        return result.success ? [] : result.error.issues.map((issue) => issue.message);
    };

    describe('ChangeUsername', function() {
        it('accepts a valid name and a note', function() {
            const result = ModActionSubmitSchema.safeParse({ ...base, actionType: ModActionType.ChangeUsername, newUsername: 'ApprovedName' });

            expect(result.success).toBeTrue();
        });

        it('requires the new username', function() {
            expect(issuePaths({ ...base, actionType: ModActionType.ChangeUsername })).toEqual(['newUsername']);
            expect(issueMessages({ ...base, actionType: ModActionType.ChangeUsername, newUsername: '' })).toEqual(['newUsername is required for ChangeUsername actions']);
        });

        it('requires a note', function() {
            expect(issuePaths({ playerId: 'player-1', actionType: ModActionType.ChangeUsername, newUsername: 'ApprovedName' })).toEqual(['note']);
            expect(issuePaths({ playerId: 'player-1', actionType: ModActionType.ChangeUsername, newUsername: 'ApprovedName', note: '   ' })).toEqual(['note']);
        });

        it('reports the format error against newUsername', function() {
            const body = { ...base, actionType: ModActionType.ChangeUsername, newUsername: 'has space' };

            expect(issuePaths(body)).toEqual(['newUsername']);
            expect(issueMessages(body)).toEqual(['Username can only contain letters, numbers, underscores (_), and periods (.).']);
        });

        it('does not accept a duration', function() {
            const body = { ...base, actionType: ModActionType.ChangeUsername, newUsername: 'ApprovedName', durationDays: 3 };

            expect(issuePaths(body)).toEqual(['durationDays']);
        });

        it('accepts KarabastUser through the standard username-change field', function() {
            const body = { ...base, actionType: ModActionType.ChangeUsername, newUsername: 'KarabastUser' };

            expect(ModActionSubmitSchema.parse(body)).toEqual(body);
        });
    });

    describe('UsernameChangesBlocked', function() {
        it('accepts a plain block', function() {
            expect(ModActionSubmitSchema.safeParse({ ...base, actionType: ModActionType.UsernameChangesBlocked }).success).toBeTrue();
        });

        it('requires a note', function() {
            expect(issuePaths({ playerId: 'player-1', actionType: ModActionType.UsernameChangesBlocked })).toEqual(['note']);
        });

        it('does not accept a duration or an explicit new username', function() {
            const body = { ...base, actionType: ModActionType.UsernameChangesBlocked, durationDays: 3, newUsername: 'ApprovedName' };

            expect(issuePaths(body).sort()).toEqual(['durationDays', 'newUsername']);
        });
    });

    describe('other actions', function() {
        it('reject a new username', function() {
            expect(issuePaths({ ...base, actionType: ModActionType.Warning, newUsername: 'ApprovedName' })).toEqual(['newUsername']);
        });

        it('keep their existing rules', function() {
            expect(ModActionSubmitSchema.safeParse({ ...base, actionType: ModActionType.Mute, durationDays: 7 }).success).toBeTrue();
            expect(issuePaths({ ...base, actionType: ModActionType.Mute })).toEqual(['durationDays']);
            expect(ModActionSubmitSchema.safeParse({ playerId: 'player-1', actionType: ModActionType.Rename }).success).toBeTrue();
        });
    });
});
