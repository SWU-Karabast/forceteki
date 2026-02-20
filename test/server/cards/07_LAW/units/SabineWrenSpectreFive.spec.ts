describe('Sabine Wren, Spectre Five', function () {
    integration(function (contextRef) {
        it('should defeat a non-unique upgrade with no Vigilance or Command units in play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sabine-wren#spectre-five'],
                    groundArena: [{ card: 'wampa', upgrades: ['condemn'] }]
                },
                player2: {
                    spaceArena: [{ card: 'distant-patroller', upgrades: ['han-solo#has-his-moments'] }, 'imperial-interceptor']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.sabineWren);
            context.player1.clickPrompt('Defeat a non-unique upgrade. If you control a Vigilance or Command unit, you may defeat an upgrade instead.');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toHavePrompt('Defeat a non-unique upgrade');

            expect(context.player1).toBeAbleToSelectExactly([context.condemn]);
            context.player1.clickCard(context.condemn);

            expect(context.player2).toBeActivePlayer();
            expect(context.condemn).toBeInZone('discard');
        });

        it('should be able to be passed with no Vigilance or Command units in play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sabine-wren#spectre-five'],
                    groundArena: [{ card: 'wampa', upgrades: ['condemn'] }]
                },
                player2: {
                    spaceArena: [{ card: 'distant-patroller', upgrades: ['han-solo#has-his-moments'] }, 'imperial-interceptor']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.sabineWren);
            context.player1.clickPrompt('Defeat a non-unique upgrade. If you control a Vigilance or Command unit, you may defeat an upgrade instead.');
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
        });

        it('should defeat any upgrade with Vigilance unit in play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sabine-wren#spectre-five'],
                    groundArena: [{ card: 'pyke-sentinel', upgrades: ['condemn'] }]
                },
                player2: {
                    spaceArena: [{ card: 'distant-patroller', upgrades: ['han-solo#has-his-moments'] }, 'imperial-interceptor']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.sabineWren);
            context.player1.clickPrompt('Defeat a non-unique upgrade. If you control a Vigilance or Command unit, you may defeat an upgrade instead.');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toHavePrompt('Defeat an upgrade');

            expect(context.player1).toBeAbleToSelectExactly([context.condemn, context.hanSolo]);
            context.player1.clickCard(context.hanSolo);

            expect(context.player2).toBeActivePlayer();
            expect(context.hanSolo).toBeInZone('discard');
        });

        it('should be able to be passed with Vigilance unit in play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sabine-wren#spectre-five'],
                    groundArena: [{ card: 'pyke-sentinel', upgrades: ['condemn'] }]
                },
                player2: {
                    spaceArena: [{ card: 'distant-patroller', upgrades: ['han-solo#has-his-moments'] }, 'imperial-interceptor']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.sabineWren);
            context.player1.clickPrompt('Defeat a non-unique upgrade. If you control a Vigilance or Command unit, you may defeat an upgrade instead.');
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
        });

        it('should defeat any upgrade with Command unit in play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sabine-wren#spectre-five'],
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['condemn'] }]
                },
                player2: {
                    spaceArena: [{ card: 'distant-patroller', upgrades: ['han-solo#has-his-moments'] }, 'imperial-interceptor']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.sabineWren);
            context.player1.clickPrompt('Defeat a non-unique upgrade. If you control a Vigilance or Command unit, you may defeat an upgrade instead.');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toHavePrompt('Defeat an upgrade');

            expect(context.player1).toBeAbleToSelectExactly([context.condemn, context.hanSolo]);
            context.player1.clickCard(context.hanSolo);

            expect(context.player2).toBeActivePlayer();
            expect(context.hanSolo).toBeInZone('discard');
        });

        it('should be able to be passed with Command unit in play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sabine-wren#spectre-five'],
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['condemn'] }]
                },
                player2: {
                    spaceArena: [{ card: 'distant-patroller', upgrades: ['han-solo#has-his-moments'] }, 'imperial-interceptor']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.sabineWren);
            context.player1.clickPrompt('Defeat a non-unique upgrade. If you control a Vigilance or Command unit, you may defeat an upgrade instead.');
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
        });
    });
});