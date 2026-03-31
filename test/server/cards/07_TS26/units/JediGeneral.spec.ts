describe('Jedi General', function() {
    integration(function(contextRef) {
        it('Jedi General\'s ability should create a Clone Token and give an Experience token to it if we control a Republic leader (undeployed)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['jedi-general'],
                    leader: 'captain-rex#fighting-for-his-brothers'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.jediGeneral);
            context.player1.clickPrompt('(No effect) Ambush');

            expect(context.player2).toBeActivePlayer();

            const troopers = context.player1.findCardsByName('clone-trooper');
            expect(troopers.length).toBe(1);
            expect(troopers[0].exhausted).toBeTrue();
            expect(troopers[0]).toHaveExactUpgradeNames(['experience']);
        });

        it('Jedi General\'s ability should create a Clone Token and give an Experience token to it if we control a Republic leader (deployed)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['jedi-general'],
                    leader: { card: 'captain-rex#fighting-for-his-brothers', deployed: true }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.jediGeneral);
            context.player1.clickPrompt('(No effect) Ambush');

            expect(context.player2).toBeActivePlayer();

            const troopers = context.player1.findCardsByName('clone-trooper');
            expect(troopers.length).toBe(1);
            expect(troopers[0].exhausted).toBeTrue();
            expect(troopers[0]).toHaveExactUpgradeNames(['experience']);
        });

        it('Jedi General\'s ability should not create a Clone Token and give an Experience token to it if we do not control a Republic leader', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['jedi-general'],
                    groundArena: ['general-krell#heartless-tactician'],
                    leader: 'chewbacca#walking-carpet'
                },
                player2: {
                    leader: 'captain-rex#fighting-for-his-brothers'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.jediGeneral);

            expect(context.player2).toBeActivePlayer();

            const troopers = context.player1.findCardsByName('clone-trooper');
            expect(troopers.length).toBe(0);
        });
    });
});
