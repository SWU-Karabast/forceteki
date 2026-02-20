describe('Flash the Vents', function () {
    integration(function (contextRef) {
        it('Flash the Vents\'s ability should initiate an attack, give +2/+0 and Overwhelm, and defeat the unit if it dealt combat damage to a base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
                player1: {
                    hand: ['flash-the-vents'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['rebel-pathfinder'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.flashTheVents);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.rebelPathfinder]);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(5);
            expect(context.battlefieldMarine).toBeInZone('discard');
        });

        it('Flash the Vents\'s ability should initiate an attack and defeat the unit if it dealt overwhelm damage to a base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
                player1: {
                    hand: ['flash-the-vents'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['rebel-pathfinder'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.flashTheVents);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.rebelPathfinder]);
            context.player1.clickCard(context.rebelPathfinder);

            expect(context.p2Base.damage).toBe(2);
            expect(context.rebelPathfinder).toBeInZone('discard');
            expect(context.battlefieldMarine).toBeInZone('discard');
        });

        it('Flash the Vents\'s ability should initiate an attack and should not defeat the unit if it did not damage a base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
                player1: {
                    hand: ['flash-the-vents'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['major-partagaz#healthcare-provider'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.flashTheVents);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.majorPartagaz]);
            context.player1.clickCard(context.majorPartagaz);

            expect(context.majorPartagaz.damage).toBe(5);
            expect(context.p2Base.damage).toBe(0);
            expect(context.battlefieldMarine).toBeInZone('groundArena');
        });

        it('Flash the Vents\'s ability should initiate an attack and defeat the unit if it dealt ability damage to a base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
                player1: {
                    hand: ['flash-the-vents'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                },
                player2: {
                    groundArena: ['major-partagaz#healthcare-provider'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.flashTheVents);
            context.player1.clickCard(context.sabineWren);

            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.majorPartagaz]);
            context.player1.clickCard(context.majorPartagaz);

            expect(context.p2Base.damage).toBe(1);
            expect(context.majorPartagaz.damage).toBe(4);
            expect(context.sabineWren).toBeInZone('base');
        });

        it('Flash the Vents\'s ability should initiate an attack and defeat the unit if it dealt ability damage to your base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
                player1: {
                    hand: ['flash-the-vents'],
                    spaceArena: ['rebellion-ywing'],
                },
                player2: {
                    groundArena: ['major-partagaz#healthcare-provider'],
                    spaceArena: ['jedi-starfighter']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.flashTheVents);
            context.player1.clickCard(context.rebellionYwing);

            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.jediStarfighter]);
            context.player1.clickCard(context.jediStarfighter);

            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p1Base);

            expect(context.p1Base.damage).toBe(1);
            expect(context.p2Base.damage).toBe(0);
            expect(context.jediStarfighter).toBeInZone('discard');
            expect(context.jediStarfighter).toBeInZone('discard');
        });
    });
});