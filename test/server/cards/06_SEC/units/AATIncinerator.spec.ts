describe('AAT Incinerator', function() {
    integration(function(contextRef) {
        it('AAT Incinerator\'s ability should deal 1 damage to up to 4 ground units when played, and deal damage to base when no friendly units are chosen', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['aat-incinerator'],
                },
                player2: {
                    groundArena: ['wampa', 'battlefield-marine', 'rebel-pathfinder', 'atst'],
                    spaceArena: ['adelphi-patrol-wing']
                },
            });

            const { context } = contextRef;
            context.player1.clickCard(context.aatIncinerator);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.battlefieldMarine, context.rebelPathfinder]);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.rebelPathfinder);
            context.player1.clickDone();

            expect(context.wampa.damage).toBe(1);
            expect(context.atst.damage).toBe(1);
            expect(context.aatIncinerator.damage).toBe(0);
            expect(context.adelphiPatrolWing.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(1);
            expect(context.rebelPathfinder.damage).toBe(1);
            expect(context.player1.base.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('AAT Incinerator\'s ability should deal 1 damage to up to 4 other ground units when played and not deal damage to base if friendly unit is chosen', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['aat-incinerator'],
                    groundArena: ['battlefield-marine', 'rebel-pathfinder'],
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['adelphi-patrol-wing']
                },
            });

            const { context } = contextRef;
            context.player1.clickCard(context.aatIncinerator);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.battlefieldMarine, context.rebelPathfinder]);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.rebelPathfinder);
            context.player1.clickDone();

            expect(context.wampa.damage).toBe(1);
            expect(context.atst.damage).toBe(1);
            expect(context.aatIncinerator.damage).toBe(0);
            expect(context.adelphiPatrolWing.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(1);
            expect(context.rebelPathfinder.damage).toBe(1);
            expect(context.player1.base.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('AAT Incinerator\'s ability should allow choosing less than 4 ground units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['aat-incinerator'],
                    groundArena: ['battlefield-marine', 'rebel-pathfinder'],
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['adelphi-patrol-wing']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.aatIncinerator);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.rebelPathfinder]);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.rebelPathfinder);
            context.player1.clickDone();

            expect(context.wampa.damage).toBe(1);
            expect(context.aatIncinerator.damage).toBe(0);
            expect(context.adelphiPatrolWing.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.rebelPathfinder.damage).toBe(1);
            expect(context.player1.base.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });
        it('AAT Incinerator\'s ability should deal damage to base if no units are chosen', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['aat-incinerator'],
                    groundArena: ['battlefield-marine', 'rebel-pathfinder'],
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['adelphi-patrol-wing']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.aatIncinerator);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.rebelPathfinder]);
            context.player1.clickPrompt('Choose Nothing');

            expect(context.wampa.damage).toBe(0);
            expect(context.aatIncinerator.damage).toBe(0);
            expect(context.adelphiPatrolWing.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.rebelPathfinder.damage).toBe(0);
            expect(context.player1.base.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('AAT Incinerator\'s ability should deal damage to base if the unit chosen had changed control', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['aat-incinerator'],
                    groundArena: ['battlefield-marine', 'rebel-pathfinder', 'death-star-stormtrooper'],
                },
                player2: {
                    hasInitiative: true,
                    hand: ['traitorous'],
                    groundArena: ['wampa'],
                    spaceArena: ['adelphi-patrol-wing']
                },
            });

            const { context } = contextRef;

            context.player2.clickCard(context.traitorous);
            context.player2.clickCard(context.deathStarStormtrooper);

            context.player1.clickCard(context.aatIncinerator);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.rebelPathfinder, context.deathStarStormtrooper]);
            context.player1.clickCard(context.deathStarStormtrooper);
            context.player1.clickDone();

            expect(context.deathStarStormtrooper).toBeInZone('discard');

            expect(context.wampa.damage).toBe(0);
            expect(context.aatIncinerator.damage).toBe(0);
            expect(context.adelphiPatrolWing.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.rebelPathfinder.damage).toBe(0);
            expect(context.player1.base.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });
    });
});