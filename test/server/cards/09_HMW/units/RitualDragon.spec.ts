describe('Ritual Dragon', function() {
    integration(function(contextRef) {
        describe('Ritual Dragon\'s ability', function() {
            it('should enter play ready (and friendly units) when you control a Tatooine base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ritual-dragon', 'porg', 'wampa'],
                        base: 'dune-sea'
                    },
                    player2: {
                        hand: ['atst'],
                        base: 'jabbas-palace'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ritualDragon);
                expect(context.ritualDragon.exhausted).toBeFalse();

                context.player2.clickCard(context.atst);
                expect(context.atst.exhausted).toBeTrue();

                context.player1.clickCard(context.porg);
                expect(context.porg.exhausted).toBeFalse();

                context.moveToNextActionPhase();

                context.player1.clickCard(context.wampa);
                expect(context.wampa.exhausted).toBeFalse();
            });

            it('should created token enters play ready when you control a Tatooine base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['ritual-dragon', 'dedra-meero#with-verifiable-data'],
                        base: 'dune-sea'
                    },
                    player2: {
                        hand: ['atst'],
                        base: 'jabbas-palace'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.dedraMeero);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                const spy = context.player1.findCardByName('spy');
                expect(spy.exhausted).toBeFalse();
            });

            it('should rescued unit enters play ready when you control a Tatooine base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['l337#droid-revolutionary'],
                        groundArena: ['ritual-dragon', 'yoda#old-master'],
                        base: 'dune-sea'
                    },
                    player2: {
                        hand: ['discerning-veteran'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.discerningVeteran);
                context.player2.clickCard(context.yoda);

                context.player1.clickCard(context.l337);
                context.player1.clickCard(context.yoda);

                expect(context.player2).toBeActivePlayer();
                expect(context.yoda.exhausted).toBeFalse();
            });

            it('should make enter play ready stolen captured units when you control a Tatooine base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dryden-vos#offering-no-escape', 'discerning-veteran'],
                        groundArena: ['ritual-dragon'],
                        base: 'dune-sea'
                    },
                    player2: {
                        groundArena: ['atst'],
                        base: 'jabbas-palace'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.discerningVeteran);
                context.player1.clickCard(context.atst);

                context.player2.passAction();

                context.player1.clickCard(context.drydenVos);
                context.player1.clickPrompt('Shielded');
                context.player1.clickCard(context.atst);

                expect(context.atst.exhausted).toBeFalse();
            });

            it('should not enter play ready when you do not control a Tatooine base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ritual-dragon'],
                        base: 'energy-conversion-lab'
                    },
                    player2: {
                        base: 'dune-sea'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ritualDragon);
                expect(context.ritualDragon.exhausted).toBeTrue();
            });

            it('friendly units should not enter play ready when Ritual Dragon is out of play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'the-warrior#deft-duelist',
                        hand: ['ritual-dragon', 'wookiee-guerilla'],
                        deck: ['ritual-dragon'],
                        resources: [
                            'ritual-dragon',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                        ],
                        base: 'dune-sea'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wookieeGuerilla);
                expect(context.wookieeGuerilla.exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
