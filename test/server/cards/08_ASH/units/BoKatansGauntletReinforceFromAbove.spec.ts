describe('Bo-Katan\'s Gauntlet, Reinforce From Above', function() {
    integration(function(contextRef) {
        it('Bo-Katan\'s Gauntlet\'s should give a when defeated ability to friendly unit which create a Mandalorian token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['bokatans-gauntlet#reinforce-from-above', 'awing']
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('discard');

            const mandalorians = context.player1.findCardsByName('mandalorian');

            expect(mandalorians.length).toBe(1);
            expect(mandalorians).toAllBeInZone('groundArena');
            expect(mandalorians.every((m) => m.exhausted)).toBeTrue();
        });

        it('Bo-Katan\'s Gauntlet\'s should not give ability to itself', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['bokatans-gauntlet#reinforce-from-above', 'awing']
                },
                player2: {
                    hasInitiative: true,
                    hand: ['takedown']
                },
            });

            const { context } = contextRef;

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.bokatansGauntlet);

            expect(context.player1).toBeActivePlayer();
            expect(context.bokatansGauntlet).toBeInZone('discard');

            const mandalorians = context.player1.findCardsByName('mandalorian');
            expect(mandalorians.length).toBe(0);
        });

        it('Bo-Katan\'s Gauntlet\'s should give ability if multiple defeat occurs', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine', 'battle-droid'],
                    spaceArena: ['bokatans-gauntlet#reinforce-from-above', 'awing', 'xwing']
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['wampa'],
                    hand: ['superlaser-blast']
                },
            });

            const { context } = contextRef;

            context.player2.clickCard(context.superlaserBlast);
            context.player1.clickPrompt('Create a Mandalorian token');

            expect(context.player1).toBeActivePlayer();

            let mandalorians = context.player1.findCardsByName('mandalorian');
            expect(mandalorians.length).toBe(2);
            expect(mandalorians).toAllBeInZone('groundArena');
            expect(mandalorians.every((m) => m.exhausted)).toBeTrue();

            mandalorians = context.player2.findCardsByName('mandalorian');
            expect(mandalorians.length).toBe(0);
        });
    });
});
