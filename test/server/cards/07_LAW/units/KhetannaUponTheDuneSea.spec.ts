describe('Khetanna, Upon the Dune Sea', function() {
    integration(function(contextRef) {
        describe('Khetanna\'s When Played ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['khetanna#upon-the-dune-sea', 'doctor-aphra#digging-for-answers', 'wampa', 'bib-fortuna#die-wanna-wanga'],
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        base: 'echo-base',
                    },
                    player2: {
                        leader: 'rio-durant#wisecracking-wheelman',
                        hand: ['greedo#slow-on-the-draw']
                    }
                });
            });

            it('should reduce the cost of the next Underworld unit played this phase by 1 and only apply once', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.khetanna);
                expect(context.player1.exhaustedResourceCount).toBe(3);

                context.player2.clickCard(context.greedo);
                expect(context.player2.exhaustedResourceCount).toBe(1);

                context.player1.clickCard(context.doctorAphra);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(6);

                context.player2.passAction();
                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(10);

                context.player2.passAction();
                context.player1.clickCard(context.bibFortuna);
                expect(context.player1.exhaustedResourceCount).toBe(12);
            });

            it('should not apply discount to non-Underworld units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.khetanna);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                context.player2.passAction();

                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                context.player2.passAction();

                context.player1.clickCard(context.doctorAphra);
                expect(context.player1.exhaustedResourceCount).toBe(10);
            });
        });

        describe('Khetanna\'s On Attack ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['doctor-aphra#digging-for-answers', 'wampa'],
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        groundArena: ['khetanna#upon-the-dune-sea'],
                        base: 'echo-base',
                    },
                    player2: {
                        leader: 'rio-durant#wisecracking-wheelman',
                        hand: ['greedo#slow-on-the-draw']
                    }
                });
            });

            it('should reduce the cost of the next Underworld unit played this phase by 1 and only apply once', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.khetanna);
                context.player1.clickCard(context.p2Base);

                context.player2.clickCard(context.greedo);
                expect(context.player2.exhaustedResourceCount).toBe(1);

                context.player1.clickCard(context.doctorAphra);
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(3);

                context.player2.passAction();
                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(7);
            });

            it('should not apply discount to non-Underworld units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.khetanna);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();

                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(4);
                context.player2.passAction();

                context.player1.clickCard(context.doctorAphra);
                expect(context.player1.exhaustedResourceCount).toBe(7);
            });
        });

        it('should apply discount twice when played with Ambush', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['khetanna#upon-the-dune-sea', 'doctor-aphra#digging-for-answers', 'bib-fortuna#die-wanna-wanga'],
                    leader: 'darth-vader#dark-lord-of-the-sith',
                    base: 'energy-conversion-lab',
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.energyConversionLab);
            context.player1.clickCard(context.khetanna);
            context.player1.clickPrompt('Ambush');
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.battlefieldMarine);

            context.player2.passAction();
            context.player1.clickCard(context.doctorAphra);
            expect(context.player1.exhaustedResourceCount).toBe(5);
            context.player2.passAction();
            context.player1.clickCard(context.bibFortuna);
            expect(context.player1.exhaustedResourceCount).toBe(7);
        });


        it('should not apply discount to Underworld event played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['khetanna#upon-the-dune-sea', 'ma-klounkee'],
                    leader: 'grand-moff-tarkin#oversector-governor',
                    groundArena: ['greedo#slow-on-the-draw'],
                    base: 'jabbas-palace',
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.khetanna);
            expect(context.player1.exhaustedResourceCount).toBe(3);

            context.player2.passAction();

            context.player1.clickCard(context.maKlounkee);
            context.player1.clickCard(context.greedo);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.exhaustedResourceCount).toBe(4);

            context.player2.passAction();

            context.player1.clickCard(context.greedo);
            expect(context.player1.exhaustedResourceCount).toBe(4);
        });
    });
});
