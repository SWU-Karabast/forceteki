import type { ISeededAccount } from './FakeDynamoDbService';
import type { DatabaseSeeder } from './TestGameServer';

/**
 * Who a spec about permissions signs in as. `nobody` holds no role; each of the others holds exactly the
 * one it is named for. The server's checks are not a ladder - `admin` satisfies every check, but
 * `moderator` and `developer` do not imply each other.
 */
export type RoleHolder = 'nobody' | 'contributor' | 'developer' | 'moderator' | 'admin';

export const roleHolders: readonly RoleHolder[] = ['nobody', 'contributor', 'developer', 'moderator', 'admin'];

export interface ISeededRoleHolders {

    /** One seeded account per {@link RoleHolder}. Filled in each time `seed` runs, so read it from the spec body, not the `describe`. */
    readonly accounts: Record<RoleHolder, ISeededAccount>;

    /** Goes in the harness's `database` option; seeds the accounts and grants each its role before the server starts. */
    readonly seed: DatabaseSeeder;
}

/**
 * Accounts holding each role, for a spec that checks who may do what. The server reads role lists
 * once at startup and then on a refresh interval, so they have to be in the database before it
 * starts - which is why this is a seeder for the harness rather than a call to make in the spec.
 */
export function seedRoleHolders(): ISeededRoleHolders {
    // filled in by `seed`, which runs before every spec; a spec that reads it earlier gets `undefined`
    const accounts: Partial<Record<RoleHolder, ISeededAccount>> = {};

    return {
        accounts: accounts as Record<RoleHolder, ISeededAccount>,
        seed: (db) => {
            for (const holder of roleHolders) {
                accounts[holder] = db.seedAccount({ username: `${holder}User` });
            }

            db.seedRoles({
                contributors: [accounts.contributor.id],
                developers: [accounts.developer.id],
                moderators: [accounts.moderator.id],
                admins: [accounts.admin.id],
            });
        },
    };
}
