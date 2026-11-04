import setCodes from '@swupgn/format/registry/setCodes.json';
import { cardIdOf, tokenSlug } from '../../../server/game/core/swupgn/SwuPgnCardIds';

describe('SWU-PGN card ids', function() {
    integration(function(contextRef) {
        it('pads the collector number to three digits', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { leader: 'luke-skywalker#faithful-friend', groundArena: ['battlefield-marine'] },
            });
            const { context } = contextRef;

            // Luke Skywalker is SOR #005
            expect(cardIdOf(context.lukeSkywalkerFaithfulFriend)).toBe('SOR#005');
            expect(cardIdOf(context.battlefieldMarine)).toMatch(/^SOR#\d{3}$/);
        });

        // W-18 (variants map to the standard printing): the card data filters variants out when it is fetched,
        // and no internalName in test/json shares a setId with another, so there is nothing to compare here.

        it('writes tokens as TOKEN:<slug>#<numeric id>', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['battlefield-marine'] },
            });
            const { context } = contextRef;

            const shield = context.game.generateToken(context.player1Object, 'shield');
            const xwing = context.game.generateToken(context.player1Object, 'xwing');
            expect(cardIdOf(shield)).toBe('TOKEN:shield#8752877738');
            expect(cardIdOf(xwing)).toBe('TOKEN:xwing#9415311381');
        });

        // `cardIdOf` fails on a set the registry does not list, and with it every flush of a game holding such a card:
        // this fails the build instead, the day a new set's cards land in the card data before the registry knows it
        it('knows every set in the card data (W-17)', async function () {
            await contextRef.setupTestAsync({ phase: 'action' });
            const registered = new Set((setCodes as { code: string }[]).map((entry) => entry.code));
            const inCardData = new Set([...contextRef.context.game.cardDataGetter.setCodeMap.keys()]
                .map((setCode) => setCode.split('_')[0].toUpperCase()));

            expect(inCardData.size).toBeGreaterThan(0);
            expect([...inCardData].filter((set) => !registered.has(set))).withContext('sets missing from the registry\'s setCodes.json')
                .toEqual([]);
        });

        it('slugs token titles', function () {
            expect(tokenSlug('TIE Fighter')).toBe('tie-fighter');
            expect(tokenSlug('X-Wing')).toBe('xwing');
            expect(tokenSlug('Clone Trooper')).toBe('clone-trooper');
            expect(tokenSlug('Éclat')).toBe('eclat');
        });
    });
});
