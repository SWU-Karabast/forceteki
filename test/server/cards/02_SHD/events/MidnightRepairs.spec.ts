describe('Midnight Repairs', function () {
    integration(function (contextRef) {
        describe('Midnight Repairs\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['midnight-repairs'],
                        groundArena: [{ card: 'pyke-sentinel', damage: 1 }],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, damage: 4 }
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 3 }],
                        spaceArena: [{ card: 'imperial-interceptor', damage: 1 }]
                    }
                });
            });

            it('should remove 8 total damage from friendly and enemy units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.midnightRepairs);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer, context.sabineWren, context.wampa, context.imperialInterceptor]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.setDistributeHealingPromptState(new Map([
                    [context.pykeSentinel, 2],
                    [context.cartelSpacer, 2],
                    [context.sabineWren, 3],
                    [context.wampa, 1]
                ]));

                expect(context.pykeSentinel.damage).toBe(0);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.sabineWren.damage).toBe(1);
                expect(context.wampa.damage).toBe(2);
                expect(context.imperialInterceptor.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to remove less than 8 damage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.midnightRepairs);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer, context.sabineWren, context.wampa, context.imperialInterceptor]);
                context.player1.setDistributeHealingPromptState(new Map([
                    [context.sabineWren, 3],
                ]));

                expect(context.pykeSentinel.damage).toBe(1);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.sabineWren.damage).toBe(1);
                expect(context.wampa.damage).toBe(3);
                expect(context.imperialInterceptor.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to choose 0 targets', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.midnightRepairs);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer, context.sabineWren, context.wampa, context.imperialInterceptor]);
                context.player1.clickPrompt('Choose no targets');

                expect(context.pykeSentinel.damage).toBe(1);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.sabineWren.damage).toBe(4);
                expect(context.wampa.damage).toBe(3);
                expect(context.imperialInterceptor.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Midnight Repairs\'s ability, if there is only one target for healing,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['midnight-repairs'],
                        groundArena: [{ card: 'battlefield-marine', damage: 2 }]
                    },
                    player2: {
                    }
                });
            });

            it('should not automatically select that target', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.midnightRepairs);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);

                context.allowTestToEndWithOpenPrompt = true;
            });
        });
    });
});
