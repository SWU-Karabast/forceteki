describe('Saesee Tiin, Courageous', function() {
    integration(function(contextRef) {
        it('Saesee Tiin, Courageous Warrior\'s ability should deal 1 damage to up to 3 units when played with initiative', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasInitiative: true,
                    hand: ['saesee-tiin#courageous-warrior'],
                    groundArena: ['battlefield-marine', 'rebel-pathfinder'],
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['adelphi-patrol-wing']
                },
            });

            const { context } = contextRef;
            context.player1.clickCard(context.saeseeTiinCourageousWarrior);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.saeseeTiinCourageousWarrior, context.battlefieldMarine, context.rebelPathfinder, context.adelphiPatrolWing]);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.saeseeTiinCourageousWarrior);
            context.player1.clickCard(context.adelphiPatrolWing);
            context.player1.clickDone();

            expect(context.wampa.damage).toBe(1);
            expect(context.saeseeTiinCourageousWarrior.damage).toBe(1);
            expect(context.adelphiPatrolWing.damage).toBe(1);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.rebelPathfinder.damage).toBe(0);
        });

        it('Saesee Tiin, Courageous Warrior\'s ability should deal 1 damage to up to 3 units when played with initiative (choose 2)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasInitiative: true,
                    hand: ['saesee-tiin#courageous-warrior'],
                    groundArena: ['battlefield-marine', 'rebel-pathfinder'],
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['adelphi-patrol-wing']
                },
            });

            const { context } = contextRef;
            context.player1.clickCard(context.saeseeTiinCourageousWarrior);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.saeseeTiinCourageousWarrior, context.battlefieldMarine, context.rebelPathfinder, context.adelphiPatrolWing]);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.adelphiPatrolWing);
            context.player1.clickDone();

            expect(context.wampa.damage).toBe(1);
            expect(context.saeseeTiinCourageousWarrior.damage).toBe(0);
            expect(context.adelphiPatrolWing.damage).toBe(1);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.rebelPathfinder.damage).toBe(0);
        });

        it('Saesee Tiin, Courageous Warrior\'s ability should not deal damage when played without initiative', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['saesee-tiin#courageous-warrior'],
                    groundArena: ['battlefield-marine', 'rebel-pathfinder'],
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['wampa'],
                    spaceArena: ['adelphi-patrol-wing']
                },
            });

            const { context } = contextRef;

            context.player2.passAction();
            context.player1.clickCard(context.saeseeTiinCourageousWarrior);
            expect(context.player2).toBeActivePlayer();
        });
    });
});