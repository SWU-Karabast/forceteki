describe('Fear And Dead Men', function () {
    integration(function (contextRef) {
        describe('Fear And Dead Men\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-vader#unstoppable',
                        hand: ['fear-and-dead-men', 'bamboozle', 'lurking-tie-phantom', 'kylos-tie-silencer#ruthlessly-efficient', 'jam-communications', 'resupply'],
                        groundArena: ['battlefield-marine'],
                        deck: ['awing'],
                        resources: 10,
                        base: 'jabbas-palace'
                    },
                    player2: {
                        hand: ['spark-of-rebellion', 'restock'],
                        groundArena: ['wampa', 'pyke-sentinel', 'atst', 'chopper#metal-menace'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should deal 4 damage to each enemy ground unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fearAndDeadMen);

                // Should deal 4 damage to each enemy ground unit
                expect(context.wampa.damage).toBe(4);
                expect(context.pykeSentinel).toBeInZone('discard'); // 3 HP, defeated
                expect(context.atst.damage).toBe(4);

                // Should not affect space units
                expect(context.cartelSpacer.damage).toBe(0);

                // Should not affect friendly units
                expect(context.battlefieldMarine.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(7);
            });

            it('should cost 1 less for each card discarded from own hand this phase', function () {
                const { context } = contextRef;

                // Use Vader's ability to discard a card
                context.player1.clickCard(context.darthVader);
                context.player1.clickPrompt('Deal 1 damage to a unit or base');
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.kylosTieSilencer);

                // Cards discarded from opponent should count for Fear and Dead Men
                context.player2.clickCard(context.sparkOfRebellion);
                context.player2.clickCardInDisplayCardPrompt(context.resupply);

                // Use Bamboozle to discard another card
                context.player1.clickCard(context.bamboozle);
                context.player1.clickPrompt('Play Bamboozle by discarding a Cunning card');
                context.player1.clickCard(context.lurkingTiePhantom);
                context.player1.clickCard(context.atst);

                // Cards discarded from deck should not count for Fear and Dead Men
                context.player2.clickCard(context.chopper);
                context.player2.clickCard(context.p1Base);
                expect(context.awing).toBeInZone('discard', context.player1);

                // Cards discarded from opponent's hand should not count for Fear and Dead Men
                context.player1.clickCard(context.jamCommunications);
                context.player1.clickCardInDisplayCardPrompt(context.restock);

                context.player2.passAction();

                // Play Fear And Dead Men - should cost 4 (7 base - 3 discarded cards)
                context.player1.clickCard(context.fearAndDeadMen);

                // Should deal 4 damage to each enemy ground unit
                expect(context.wampa.damage).toBe(4);
                expect(context.pykeSentinel).toBeInZone('discard'); // 3 HP, defeated
                expect(context.atst.damage).toBe(5); // 1 from Vader + 4 from Fear And Dead Men

                // Should not affect space units
                expect(context.cartelSpacer.damage).toBe(0);

                // Should not affect friendly units
                expect(context.battlefieldMarine.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
                // Cost: 7 base - 3 discards + 1+2 for jam communications = 7
                expect(context.player1.exhaustedResourceCount).toBe(7);
            });

            it('should not get discount from cards discarded last phase', function () {
                const { context } = contextRef;

                // Use Vader's ability to discard a card
                context.player1.clickCard(context.darthVader);
                context.player1.clickPrompt('Deal 1 damage to a unit or base');
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.kylosTieSilencer);

                // Move to next action phase - discards from previous phase shouldn't count
                context.moveToNextActionPhase();

                // Play Fear And Dead Men - should cost full 7 (no discount)
                context.player1.clickCard(context.fearAndDeadMen);

                // Should deal 4 damage to each enemy ground unit
                expect(context.wampa.damage).toBe(4);
                expect(context.pykeSentinel).toBeInZone('discard'); // 3 HP, defeated
                expect(context.atst.damage).toBe(5); // 1 from Vader last phase + 4 from Fear And Dead Men

                expect(context.player2).toBeActivePlayer();
                // Cost: 7 base (no discount from last phase)
                expect(context.player1.exhaustedResourceCount).toBe(7);
            });
        });

        it('should prompt confirmation when playing with no enemy ground units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fear-and-dead-men'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fearAndDeadMen);

            expect(context.player1).toHavePrompt('Playing Fear and Dead Men will have no effect. Are you sure you want to play it?');
            expect(context.player1).toHaveExactPromptButtons(['Play anyway', 'Cancel']);

            context.player1.clickPrompt('Play anyway');

            expect(context.fearAndDeadMen).toBeInZone('discard');
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.cartelSpacer.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
