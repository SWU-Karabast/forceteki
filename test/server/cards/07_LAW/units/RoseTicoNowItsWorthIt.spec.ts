describe('Rose Tico, Now It\'s Worth It', function () {
    integration(function (contextRef) {
        it('should enter play ready when controlling a non-unique unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rose-tico#now-its-worth-it'],
                    groundArena: ['battlefield-marine', 'luke-skywalker#jedi-knight']
                },
                player2: {}
            });

            const { context } = contextRef;

            context.player1.clickCard(context.roseTico);

            expect(context.player2).toBeActivePlayer();
            expect(context.roseTico.exhausted).toBeFalse();
        });

        it('should enter play exhausted when not controlling a non-unique unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rose-tico#now-its-worth-it'],
                    groundArena: ['luke-skywalker#jedi-knight'] // unique
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.roseTico);

            expect(context.player2).toBeActivePlayer();
            expect(context.roseTico.exhausted).toBeTrue();
        });

        it('should enter play exhausted when controlling no units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rose-tico#now-its-worth-it']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.roseTico);

            expect(context.player2).toBeActivePlayer();
            expect(context.roseTico.exhausted).toBeTrue();
        });

        it('should enter play ready with non-unique space unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rose-tico#now-its-worth-it'],
                    spaceArena: ['cartel-spacer'] // non-unique space unit
                },
                player2: {}
            });

            const { context } = contextRef;

            context.player1.clickCard(context.roseTico);

            expect(context.player2).toBeActivePlayer();
            expect(context.roseTico.exhausted).toBeFalse();
        });

        it('should enter play ready after being rescued', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rivals-fall'],
                    groundArena: ['rose-tico#now-its-worth-it', 'battlefield-marine'],
                },
                player2: {
                    hasInitiative: true,
                    hand: ['discerning-veteran']
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.discerningVeteran);
            context.player2.clickCard(context.roseTico);

            context.player1.clickCard(context.rivalsFall);
            context.player1.clickCard(context.discerningVeteran);

            expect(context.player2).toBeActivePlayer();
            expect(context.roseTico).toBeInZone('groundArena', context.player1);
            expect(context.roseTico.exhausted).toBeFalse();
        });
    });
});
