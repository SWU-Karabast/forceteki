describe('Enoch, Solemn Servant', function() {
    integration(function(contextRef) {
        it('should deal up to 6 damage to base when defeated and reduce cost, dealing 6 and reducing 3', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa'],
                    groundArena: ['enoch#solemn-servant', 'battlefield-marine'],
                    leader: 'grand-inquisitor#hunting-the-jedi'
                },
                player2: {
                    hand: ['atst', 'vanquish', 'no-glory-only-results'],
                    spaceArena: ['awing'],
                    leader: 'cad-bane#he-who-needs-no-introduction',
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.enoch);

            expect(context.player1).toBeAbleToSelectExactly([context.p1Base]);
            context.player1.setDistributeDamagePromptState(new Map([
                [context.p1Base, 6],
            ]));

            context.player1.clickCard(context.wampa);

            expect(context.player1.exhaustedResourceCount).toBe(1);
            expect(context.p1Base.damage).toBe(6);
            expect(context.p2Base.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('should deal up to 6 damage to base when defeated and reduce cost, dealing 4 and reducing 2', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa'],
                    groundArena: ['enoch#solemn-servant', 'battlefield-marine'],
                    leader: 'grand-inquisitor#hunting-the-jedi'
                },
                player2: {
                    hand: ['atst', 'vanquish', 'no-glory-only-results'],
                    spaceArena: ['awing'],
                    leader: 'cad-bane#he-who-needs-no-introduction',
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.enoch);

            expect(context.player1).toBeAbleToSelectExactly([context.p1Base]);
            context.player1.setDistributeDamagePromptState(new Map([
                [context.p1Base, 4],
            ]));

            context.player1.clickCard(context.wampa);

            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.p1Base.damage).toBe(4);
            expect(context.p2Base.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('should deal up to 6 damage to base when defeated and reduce cost, dealing 1 and reducing 0', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa'],
                    groundArena: ['enoch#solemn-servant', 'battlefield-marine'],
                    leader: 'grand-inquisitor#hunting-the-jedi'
                },
                player2: {
                    hand: ['atst', 'vanquish', 'no-glory-only-results'],
                    spaceArena: ['awing'],
                    leader: 'cad-bane#he-who-needs-no-introduction',
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.enoch);

            expect(context.player1).toBeAbleToSelectExactly([context.p1Base]);
            context.player1.setDistributeDamagePromptState(new Map([
                [context.p1Base, 1],
            ]));

            context.player1.clickCard(context.wampa);

            expect(context.player1.exhaustedResourceCount).toBe(4);
            expect(context.p1Base.damage).toBe(1);
            expect(context.p2Base.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('should deal up to 6 damage to base when defeated and reduce cost, dealing 0 and reducing 0', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa'],
                    groundArena: ['enoch#solemn-servant', 'battlefield-marine'],
                    leader: 'grand-inquisitor#hunting-the-jedi'
                },
                player2: {
                    hand: ['atst', 'vanquish', 'no-glory-only-results'],
                    spaceArena: ['awing'],
                    leader: 'cad-bane#he-who-needs-no-introduction',
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.enoch);

            expect(context.player1).toBeAbleToSelectExactly([context.p1Base]);
            context.player1.setDistributeDamagePromptState(new Map([]));

            context.player1.clickCard(context.wampa);

            expect(context.player1.exhaustedResourceCount).toBe(4);
            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('should work with NGOR', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa'],
                    groundArena: ['enoch#solemn-servant', 'battlefield-marine'],
                    leader: 'grand-inquisitor#hunting-the-jedi'
                },
                player2: {
                    hand: ['atst', 'vanquish', 'no-glory-only-results'],
                    spaceArena: ['awing'],
                    leader: 'cad-bane#he-who-needs-no-introduction',
                    base: 'dagobah-swamp',
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.enoch);

            expect(context.player2).toBeAbleToSelectExactly([context.p2Base]);
            context.player2.setDistributeDamagePromptState(new Map([
                [context.p2Base, 6],
            ]));

            context.player1.passAction();

            context.player2.clickCard(context.atst);

            expect(context.player2.exhaustedResourceCount).toBe(8);
            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(6);
            expect(context.player1).toBeActivePlayer();
        });
    });
});