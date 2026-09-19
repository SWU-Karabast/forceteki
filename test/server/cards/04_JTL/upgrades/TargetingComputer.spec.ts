describe('Targeting Computer', function () {
    // TODO: once a card that checks a unit's live ability count is merged (e.g. Rex, Outserved His Purpose),
    // add a test here confirming the attached unit's gained "assign indirect damage" ability shows up in that
    // count. A "lose all abilities, then attack" test can't observe this directly: the only way to trigger
    // indirect damage from this unit is via one of its own abilities, which "lose all abilities" also removes,
    // so the assignment behavior can't be exercised while abilities are stripped.
    integration(function (contextRef) {
        it('should make indirect damage dealt by the attached unit be assigned by the controller of the attached unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: [{ card: 'tie-bomber', upgrades: ['targeting-computer'] }],
                },
                player2: {
                    groundArena: ['pyke-sentinel'],
                    spaceArena: ['inferno-four#unforgetting'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.tieBomber);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.infernoFour, context.p2Base]);

            context.player1.setDistributeIndirectDamagePromptState(new Map([
                [context.pykeSentinel, 1],
                [context.p2Base, 2],
            ]));

            expect(context.infernoFour.damage).toBe(0);
            expect(context.pykeSentinel.damage).toBe(1);
            expect(context.p2Base.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });

        it('should not affect indirect damage dealt by another friendly unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: [{ card: 'fetts-firespray#feared-silhouette', upgrades: ['targeting-computer'] }, 'tie-bomber'],
                },
                player2: {
                    groundArena: ['pyke-sentinel'],
                    spaceArena: ['inferno-four#unforgetting'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.tieBomber);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeAbleToSelectExactly([context.pykeSentinel, context.infernoFour, context.p2Base]);

            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.pykeSentinel, 1],
                [context.p2Base, 2],
            ]));

            expect(context.infernoFour.damage).toBe(0);
            expect(context.pykeSentinel.damage).toBe(1);
            expect(context.p2Base.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });
    });
});