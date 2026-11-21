import { RegisteredCosmeticType } from '../../../../../server/utils/cosmetics/CosmeticsInterfaces';
import type { ICosmeticEntity } from '../../../../../server/utils/cosmetics/CosmeticsInterfaces';
import { cosmeticImageOrigin, uploadedCosmetic, uploadedImagePath } from '../../../../helpers/server/CosmeticFixtures';
import { seedRoleHolders } from '../../../../helpers/server/RoleHolders';
import { serverIntegration } from '../../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../../helpers/server/ServerTestHarness';

/** Cosmetics already in the database when each spec starts. */
const existingCardback = uploadedCosmetic(RegisteredCosmeticType.Cardback, 'Existing Cardback');
const existingBackground = uploadedCosmetic(RegisteredCosmeticType.Background, 'Existing Background');

/**
 * What a moderator or admin may add to the cosmetics list through `POST /api/cosmetics`, beyond which types each
 * role may add (`RoleAuthorization.spec.ts`): only a new cosmetic, made of a cosmetic's own fields, whose image is the
 * one the client's upload route stored for it.
 */
describe('Cosmetic creation', function () {
    const roles = seedRoleHolders();

    async function postCosmeticAsync(harness: ServerTestHarness, holder: 'moderator' | 'admin', cosmetic: unknown) {
        return await harness.createAccountClient(roles.accounts[holder]).requestAsync('post', '/api/cosmetics', { cosmetic });
    }

    function expectStoredCosmetics(harness: ServerTestHarness, expected: ICosmeticEntity[]): void {
        expect([...harness.db.cosmetics.values()]).toEqual(jasmine.arrayWithExactContents(expected));
    }

    describe('on a development server', function () {
        serverIntegration(function (contextRef) {
            it('stores and answers with only the fields of a cosmetic', async function () {
                const { harness } = contextRef;
                const cosmetic = uploadedCosmetic(RegisteredCosmeticType.Cardback);

                const response = await postCosmeticAsync(harness, 'moderator', { ...cosmetic, featured: true, createdBy: 'someone' });

                expect(response.status).toBe(201);
                expect(response.body.cosmetic).toEqual(cosmetic);
                expect(harness.db.cosmetics.get(cosmetic.id)).toEqual(cosmetic);
            });

            it('reports a stored cosmetic as created even when the cosmetics list cannot be re-read straight away', async function () {
                const { harness } = contextRef;
                const cosmetic = uploadedCosmetic(RegisteredCosmeticType.Cardback);
                spyOn(harness.db, 'getCosmeticsAsync').and.rejectWith(new Error('read failed'));

                const response = await postCosmeticAsync(harness, 'moderator', cosmetic);

                expect(response.status).toBe(201);
                expect(harness.db.cosmetics.get(cosmetic.id)).toEqual(cosmetic);
            });

            it('refuses an id that is already taken, and leaves that cosmetic as it was', async function () {
                const { harness } = contextRef;

                const response = await postCosmeticAsync(harness, 'admin', { ...existingCardback, title: 'Replacement' });

                expect(response.status).toBe(409);
                expectStoredCosmetics(harness, [existingCardback, existingBackground]);
            });

            it('refuses a moderator reusing the id of a cosmetic of another type as a card back', async function () {
                const { harness } = contextRef;
                const asCardback: ICosmeticEntity = {
                    id: existingBackground.id,
                    title: 'Replacement',
                    type: RegisteredCosmeticType.Cardback,
                    path: uploadedImagePath(RegisteredCosmeticType.Cardback, existingBackground.id),
                };

                const response = await postCosmeticAsync(harness, 'moderator', asCardback);

                expect(response.status).toBe(409);
                expectStoredCosmetics(harness, [existingCardback, existingBackground]);
            });

            const otherPaths: { description: string; path: (cosmetic: ICosmeticEntity) => string }[] = [
                { description: 'on another site', path: (cosmetic) => `https://example.test/cardbacks/${cosmetic.id}.webp` },
                { description: 'in another type\'s folder', path: (cosmetic) => uploadedImagePath(RegisteredCosmeticType.Background, cosmetic.id) },
                { description: 'stored for another cosmetic', path: () => existingCardback.path },
                { description: 'with another file name', path: (cosmetic) => `${cosmeticImageOrigin}/cardbacks/${cosmetic.id}.png` },
            ];
            for (const { description, path } of otherPaths) {
                it(`refuses an image path ${description}`, async function () {
                    const { harness } = contextRef;
                    const cosmetic = uploadedCosmetic(RegisteredCosmeticType.Cardback);

                    const response = await postCosmeticAsync(harness, 'admin', { ...cosmetic, path: path(cosmetic) });

                    expect(response.status).toBe(400);
                    expectStoredCosmetics(harness, [existingCardback, existingBackground]);
                });
            }

            it('accepts the image path of the local S3 mock', async function () {
                const { harness } = contextRef;
                const cosmetic = uploadedCosmetic(RegisteredCosmeticType.Cardback);
                const localPath = `http://localhost:9090/karabast-customization/cardbacks/${cosmetic.id}.webp`;

                const response = await postCosmeticAsync(harness, 'moderator', { ...cosmetic, path: localPath });

                expect(response.status).toBe(201);
                expect(harness.db.cosmetics.get(cosmetic.id)).toEqual({ ...cosmetic, path: localPath });
            });

            // the image path is built from the id itself, so only the id's own format can be what is refused
            const otherIds: { description: string; id: string }[] = [
                { description: 'is not a UUID', id: 'cardback-2' },
                { description: 'is made of path segments', id: `x/../../backgrounds/${existingBackground.id}` },
                { description: 'is a UUID with more after it', id: `${existingCardback.id}/x` },
            ];
            for (const { description, id } of otherIds) {
                it(`refuses a card back whose id ${description}, even with the image path for that id`, async function () {
                    const { harness } = contextRef;
                    const cosmetic: ICosmeticEntity = {
                        id,
                        title: 'Other Id',
                        type: RegisteredCosmeticType.Cardback,
                        path: uploadedImagePath(RegisteredCosmeticType.Cardback, id),
                    };

                    const response = await postCosmeticAsync(harness, 'moderator', cosmetic);

                    expect(response.status).toBe(400);
                    expectStoredCosmetics(harness, [existingCardback, existingBackground]);
                });
            }

            const malformed: { description: string; change: Partial<Record<keyof ICosmeticEntity, unknown>> }[] = [
                { description: 'an empty title', change: { title: '   ' } },
                { description: 'a title over 100 characters', change: { title: 'x'.repeat(101) } },
                { description: 'no path', change: { path: undefined } },
            ];
            for (const { description, change } of malformed) {
                it(`refuses a card back with ${description}`, async function () {
                    const { harness } = contextRef;
                    const cosmetic = uploadedCosmetic(RegisteredCosmeticType.Cardback);

                    const response = await postCosmeticAsync(harness, 'moderator', { ...cosmetic, ...change });

                    expect(response.status).toBe(400);
                    expectStoredCosmetics(harness, [existingCardback, existingBackground]);
                });
            }
        }, {
            database: (db) => {
                roles.seed(db);
                db.cosmetics.set(existingCardback.id, existingCardback);
                db.cosmetics.set(existingBackground.id, existingBackground);
            },
        });
    });

    describe('on a production-like server', function () {
        serverIntegration(function (contextRef) {
            it('refuses the image path of the local S3 mock', async function () {
                const { harness } = contextRef;
                const cosmetic = uploadedCosmetic(RegisteredCosmeticType.Cardback);

                const response = await postCosmeticAsync(harness, 'moderator', {
                    ...cosmetic,
                    path: `http://localhost:9090/karabast-customization/cardbacks/${cosmetic.id}.webp`,
                });

                expect(response.status).toBe(400);
                expect(harness.db.cosmetics.has(cosmetic.id)).toBeFalse();
            });

            it('accepts the image path of the upload bucket', async function () {
                const { harness } = contextRef;
                const cosmetic = uploadedCosmetic(RegisteredCosmeticType.Cardback);

                const response = await postCosmeticAsync(harness, 'moderator', cosmetic);

                expect(response.status).toBe(201);
                expect(harness.db.cosmetics.get(cosmetic.id)).toEqual(cosmetic);
            });
        }, { env: { ENVIRONMENT: 'production' }, database: roles.seed });
    });
});
