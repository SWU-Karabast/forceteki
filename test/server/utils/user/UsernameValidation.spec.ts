import { getUsernameValidationError } from '../../../../server/utils/user/UsernameValidation';

describe('getUsernameValidationError', function() {
    it('accepts letters, numbers, underscores and periods', function() {
        expect(getUsernameValidationError('Ben_Ewering.42')).toBeNull();
    });

    it('accepts names of exactly 3 and 32 characters', function() {
        expect(getUsernameValidationError('abc')).toBeNull();
        expect(getUsernameValidationError('a'.repeat(32))).toBeNull();
    });

    it('rejects an empty or whitespace-only name', function() {
        expect(getUsernameValidationError('')).toBe('Username cannot be empty.');
        expect(getUsernameValidationError('   ')).toBe('Username cannot be empty.');
    });

    it('rejects names shorter than 3 or longer than 32 characters', function() {
        expect(getUsernameValidationError('ab')).toBe('Username must be at least 3 characters long.');
        expect(getUsernameValidationError('a'.repeat(33))).toBe('Username cannot be more than 32 characters long.');
    });

    it('rejects spaces anywhere in the name', function() {
        const message = 'Username can only contain letters, numbers, underscores (_), and periods (.).';

        expect(getUsernameValidationError('Foo Bar')).toBe(message);
        expect(getUsernameValidationError(' FooBar')).toBe(message);
        expect(getUsernameValidationError('FooBar ')).toBe(message);
    });

    it('rejects other special characters', function() {
        expect(getUsernameValidationError('Foo-Bar')).not.toBeNull();
        expect(getUsernameValidationError('Föö')).not.toBeNull();
        expect(getUsernameValidationError('Foo#1')).not.toBeNull();
    });

    it('rejects two consecutive periods', function() {
        expect(getUsernameValidationError('Foo..Bar')).toBe('Username cannot have two consecutive periods.');
    });

    it('rejects a name starting or ending with a period or underscore', function() {
        const message = 'Username cannot start or end with a period or underscore.';

        expect(getUsernameValidationError('.FooBar')).toBe(message);
        expect(getUsernameValidationError('FooBar.')).toBe(message);
        expect(getUsernameValidationError('_FooBar')).toBe(message);
        expect(getUsernameValidationError('FooBar_')).toBe(message);
    });
});
