import jwt from 'jsonwebtoken';
import { UserFactory } from '../../../../server/utils/user/UserFactory';

describe('UserFactory development test users', () => {
    const originalEnvironment = process.env.ENVIRONMENT;
    const originalUseLocalDynamoDb = process.env.USE_LOCAL_DYNAMODB;
    const originalNextAuthSecret = process.env.NEXTAUTH_SECRET;

    beforeEach(() => {
        process.env.ENVIRONMENT = 'development';
        process.env.USE_LOCAL_DYNAMODB = 'false';
        process.env.NEXTAUTH_SECRET = 'test-secret';
    });

    afterEach(() => {
        if (originalEnvironment === undefined) {
            delete process.env.ENVIRONMENT;
        } else {
            process.env.ENVIRONMENT = originalEnvironment;
        }
        if (originalUseLocalDynamoDb === undefined) {
            delete process.env.USE_LOCAL_DYNAMODB;
        } else {
            process.env.USE_LOCAL_DYNAMODB = originalUseLocalDynamoDb;
        }
        if (originalNextAuthSecret === undefined) {
            delete process.env.NEXTAUTH_SECRET;
        } else {
            process.env.NEXTAUTH_SECRET = originalNextAuthSecret;
        }
    });

    it('uses the legacy local user identity when DynamoDB is disabled', async () => {
        const token = jwt.sign({
            provider: 'dev-user',
            providerId: 'order66',
            name: 'Order66',
        }, process.env.NEXTAUTH_SECRET);

        const user = await new UserFactory().createUserFromTokenAsync(token);

        expect(user.isAnonymousUser()).toBeTrue();
        expect(user.isAuthenticatedUser()).toBeFalse();
        expect(user.isDevTestUser()).toBeTrue();
        expect(user.getId()).toBe('exe66');
        expect(user.getUsername()).toBe('Order66');
    });
});
