import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

import type { IDeckDataEntity, IModActionEntity, IUserProfileDataEntity } from '../../../server/services/DynamoDBInterfaces';
import { ModActionType, UsernameChangeSource } from '../../../server/services/DynamoDBInterfaces';
import { DynamoDBService } from '../../../server/services/DynamoDBService';
import type { IItemKey } from '../../../server/services/DynamoDBService';
import type { ICosmeticEntity } from '../../../server/utils/cosmetics/CosmeticsInterfaces';
import { RegisteredCosmeticType } from '../../../server/utils/cosmetics/CosmeticsInterfaces';

const profile: IUserProfileDataEntity = { id: 'user-1', username: 'Someone', lastLogin: '2026-01-01', createdAt: '2026-01-01', showWelcomeMessage: false };

const deck: IDeckDataEntity = {
    id: 'deck-1',
    userId: 'user-1',
    deck: {
        leader: { id: 'SOR_005' },
        base: { id: 'SOR_026' },
        name: 'Test Deck',
        favourite: false,
        deckLink: 'https://swudb.com/deck/abc123',
        deckLinkID: 'abc123',
    },
    stats: { wins: 1, losses: 2, draws: 0, statsByMatchup: [] },
};

const cosmetic: ICosmeticEntity = { id: 'cosmetic-1', title: 'Gold', type: RegisteredCosmeticType.Cardback, path: 'https://example.test/gold.webp' };

const mute: IModActionEntity = {
    id: 'action-1',
    playerId: 'user-1',
    actionType: ModActionType.Mute,
    durationDays: 3,
    note: 'spam',
    moderatorId: 'moderator-1',
    moderatorUsername: 'Moderator',
    createdAt: '2026-01-01',
};

/**
 * How `DynamoDBService` builds the items it writes, checked against a document client that records the commands
 * it is sent. Every item's key is computed by the method that saves it; the data it saves never supplies one.
 */
describe('DynamoDBService', function () {
    let client: jasmine.SpyObj<DynamoDBDocumentClient>;
    let service: DynamoDBService;

    beforeEach(function () {
        client = jasmine.createSpyObj<DynamoDBDocumentClient>('DynamoDBDocumentClient', ['send']);
        (client.send as jasmine.Spy).and.resolveTo({});
        service = new DynamoDBService(client);
    });

    /** The input of every put command sent so far. */
    function sentPuts(): PutCommand['input'][] {
        return (client.send as jasmine.Spy).calls.allArgs()
            .map(([command]: [unknown]) => command)
            .filter((command): command is PutCommand => command instanceof PutCommand)
            .map((command) => command.input);
    }

    function onlyPut(): PutCommand['input'] {
        const puts = sentPuts();
        expect(puts.length).withContext('put commands sent')
            .toBe(1);
        return puts[0];
    }

    describe('each save', function () {
        const saves: { description: string; saveAsync: (service: DynamoDBService) => Promise<unknown>; key: IItemKey }[] = [
            { description: 'a profile', saveAsync: (db) => db.saveUserProfileAsync(profile), key: { pk: 'USER#user-1', sk: 'PROFILE' } },
            { description: 'a deck', saveAsync: (db) => db.saveDeckAsync(deck), key: { pk: 'USER#user-1', sk: 'DECK#deck-1' } },
            { description: 'a cosmetic', saveAsync: (db) => db.saveCosmeticAsync(cosmetic), key: { pk: 'COSMETICS', sk: 'ITEM#cosmetic-1' } },
            {
                description: 'a sign-in link',
                saveAsync: (db) => db.saveOAuthLinkAsync('discord', '123', 'user-1'),
                key: { pk: 'OAUTH#discord_123', sk: 'LINK', GSI_PK: 'user-1' },
            },
            {
                description: 'an email link',
                saveAsync: (db) => db.saveEmailLinkAsync('Someone@Example.test', 'user-1'),
                key: { pk: 'EMAIL#someone@example.test', sk: 'LINK', GSI_PK: 'user-1' },
            },
            {
                description: 'a username link',
                saveAsync: (db) => db.saveUsernameLinkAsync('Someone', 'user-1'),
                key: { pk: 'USERNAME#someone', sk: 'USER#user-1', GSI_PK: 'user-1' },
            },
            {
                description: 'a tracked mod action',
                saveAsync: (db) => db.saveModActionAsync(mute),
                key: { pk: 'USER#user-1', sk: 'MODACTION#action-1', GSI_PK: 'ACTIVE_MODACTION' },
            },
            {
                description: 'an untracked mod action',
                saveAsync: (db) => db.saveModActionAsync({ ...mute, actionType: ModActionType.Warning, durationDays: undefined }),
                key: { pk: 'USER#user-1', sk: 'MODACTION#action-1' },
            },
            {
                description: 'a username change',
                saveAsync: (db) => db.saveUsernameChangeAsync({
                    id: 'change-1', playerId: 'user-1', previousUsername: null, newUsername: 'Someone',
                    source: UsernameChangeSource.AccountCreation, createdAt: '2026-01-01',
                }),
                key: { pk: 'USER#user-1', sk: 'NAMECHANGE#change-1' },
            },
            { description: 'the server settings', saveAsync: (db) => db.saveServerSettingsAsync({ gamesEnabled: false }), key: { pk: 'SERVER_SETTINGS', sk: 'GLOBAL' } },
        ];

        for (const { description, saveAsync, key } of saves) {
            it(`writes ${description} under the key it computes`, async function () {
                await saveAsync(service);

                const { Item } = onlyPut();
                expect({ pk: Item.pk, sk: Item.sk, GSI_PK: Item.GSI_PK }).toEqual({ GSI_PK: undefined, ...key });
                expect(Object.prototype.hasOwnProperty.call(Item, 'GSI_PK')).withContext('GSI_PK present')
                    .toBe(key.GSI_PK !== undefined);
            });
        }
    });

    describe('putItemAsync', function () {
        for (const field of ['pk', 'sk', 'GSI_PK']) {
            it(`refuses attributes with a ${field} field, and sends nothing`, async function () {
                await expectAsync(service.putItemAsync({ pk: 'A', sk: 'B' }, { [field]: 'C', other: 1 }))
                    .toBeRejectedWithError(/key field/);

                expect(client.send).not.toHaveBeenCalled();
            });
        }

        it('writes the key together with the attributes, and a condition when given one', async function () {
            await service.putItemAsync({ pk: 'A', sk: 'B', GSI_PK: 'C' }, { other: 1 }, 'attribute_not_exists(pk)');

            expect(onlyPut()).toEqual(jasmine.objectContaining({
                Item: { other: 1, pk: 'A', sk: 'B', GSI_PK: 'C' },
                ConditionExpression: 'attribute_not_exists(pk)',
            }));
        });
    });

    describe('saveDeckAsync', function () {
        it('stores only the fields of a deck, under its owner and id', async function () {
            const withOtherFields = { ...deck, pk: 'OTHER', sk: 'OTHER', GSI_PK: 'OTHER', label: 'not part of a deck' };

            await service.saveDeckAsync(withOtherFields);

            expect(onlyPut().Item).toEqual({ pk: 'USER#user-1', sk: 'DECK#deck-1', id: 'deck-1', userId: 'user-1', deck: deck.deck, stats: deck.stats });
        });

        it('gives a deck saved without results an empty record', async function () {
            const { stats: _stats, ...withoutStats } = deck;

            await service.saveDeckAsync(withoutStats);

            expect(onlyPut().Item.stats).toEqual({ wins: 0, losses: 0, draws: 0 });
        });

        it('refuses a deck its schema rejects, and sends nothing', async function () {
            const invalid = { ...deck, deck: { ...deck.deck, name: 42 } } as unknown as IDeckDataEntity;

            await expectAsync(service.saveDeckAsync(invalid)).toBeRejected();

            expect(sentPuts()).toEqual([]);
        });
    });

    describe('saveCosmeticAsync', function () {
        it('stores only the fields of a cosmetic', async function () {
            const withOtherFields = { ...cosmetic, pk: 'OTHER', sk: 'OTHER', label: 'not part of a cosmetic' };

            await service.saveCosmeticAsync(withOtherFields);

            expect(onlyPut().Item).toEqual({
                pk: 'COSMETICS',
                sk: 'ITEM#cosmetic-1',
                id: 'cosmetic-1',
                title: 'Gold',
                type: RegisteredCosmeticType.Cardback,
                path: 'https://example.test/gold.webp',
                createdAt: jasmine.any(String),
                updatedAt: jasmine.any(String),
            });
        });

        it('only writes over an existing cosmetic when not asked to create one', async function () {
            await service.saveCosmeticAsync(cosmetic);
            await service.saveCosmeticAsync(cosmetic, { createOnly: true });

            expect(sentPuts().map((put) => put.ConditionExpression)).toEqual([undefined, 'attribute_not_exists(pk)']);
        });
    });
});
