describe('Targeting Computer', function () {
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

        // Ruling 2025-03-25 / 2025-04-30: Last Known Information covers information needed to resolve an
        // ability, but granted abilities are not active from the discard pile while resolving a "When
        // Defeated" ability. So Targeting Computer's "assign indirect damage" ability does NOT apply
        // when the attached unit is defeated and resolves a When-Defeated indirect-damage ability —
        // the controller cannot assign that indirect damage via Targeting Computer.
        xit('does not let you assign indirect damage from a When Defeated ability (it is not active from the discard)', function () {
            // A unit has Targeting Computer attached and a "When Defeated: deal indirect damage" ability
            // (e.g. Droid Missile Platform / General Krell-granted). The unit is defeated and its When
            // Defeated indirect damage resolves. Targeting Computer's assign-indirect-damage ability is
            // not active from the discard, so the controller does not get to assign that indirect damage.
        });
    });
});