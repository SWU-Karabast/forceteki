describe('Sneak Attack', function() {
    integration(function(contextRef) {
        describe('Sneak Attack\'s ability', function() {
            it('should play Sabine for 1 resource less and defeat it at the end.', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sneak-attack', 'sabine-wren#you-can-count-on-me', 'obiwan-kenobi#following-fate', 'recruit'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                        base: 'administrators-tower',
                        leader: 'luke-skywalker#faithful-friend',
                        resources: 3
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sneakAttack);
                expect(context.player1).toBeAbleToSelectExactly([context.sabineWren]);
                context.player1.clickCard(context.sabineWren);
                expect(context.sabineWren.exhausted).toBeFalse();
                expect(context.player1.readyResourceCount).toBe(0);

                // Check that Sabine is defeated at the beginning of the regroup phase
                context.moveToRegroupPhase();
                expect(context.sabineWren).toBeInZone('discard');
                expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
            });

            it('should not bug if there is no legal card to be played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sneak-attack', 'sabine-wren#you-can-count-on-me', 'recruit'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                        base: 'administrators-tower',
                        leader: 'luke-skywalker#faithful-friend',
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                context.player2.passAction();
                context.player1.clickCard(context.sneakAttack);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not bug if Sabine is defeated before the end of the phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sneak-attack', 'sabine-wren#you-can-count-on-me', 'obiwan-kenobi#following-fate', 'recruit'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                        base: 'administrators-tower',
                        leader: 'luke-skywalker#faithful-friend',
                        resources: 3
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sneakAttack);
                context.player1.clickCard(context.sabineWren);
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.sabineWren);
                expect(context.sabineWren).toBeInZone('discard');
            });

            it('should trigger "when played" and "when defeated" abilities at the correct timing point', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sneak-attack', 'ruthless-raider'],
                        base: 'administrators-tower',
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        resources: 5
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sneakAttack);
                expect(context.player1).toBeAbleToSelectExactly([context.ruthlessRaider]);
                context.player1.clickCard(context.ruthlessRaider);

                // "when played" ability triggers
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.p2Base.damage).toBe(2);
                expect(context.wampa.damage).toBe(2);

                // move to end of action phase
                context.player2.passAction();
                context.player1.passAction();

                // Checking When Defeated
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                expect(context.ruthlessRaider).toBeInZone('discard');
                context.player1.clickCard(context.wampa);
                expect(context.p2Base.damage).toBe(4);
                expect(context.wampa.damage).toBe(4);

                expect(context.game.currentPhase).toBe('regroup');
            });

            // TODO: Fix this test cf https://github.com/SWU-Karabast/forceteki/pull/389#discussion_r1898603793
            // it('should not defeat Sabine if she is waylay back in hand and played back the same phase', function () {
            //     contextRef.setupTest({
            //         phase: 'action',
            //         player1: {
            //             hand: ['sneak-attack', 'sabine-wren#you-can-count-on-me', 'recruit'],
            //             groundArena: ['battlefield-marine'],
            //             spaceArena: ['cartel-spacer'],
            //             base: 'administrators-tower',
            //             leader: 'luke-skywalker#faithful-friend',
            //         },
            //         player2: {
            //             hand: ['waylay']
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.clickCard(context.sneakAttack);
            //     context.player1.clickCard(context.sabineWren);

            //     // Waylay Sabine back in hand
            //     context.player2.clickCard(context.waylay);
            //     context.player2.clickCard(context.sabineWren);

            //     // Sabine is played back
            //     context.player1.clickCard(context.sabineWren);
            //     context.nextPhase();
            //     expect(context.sabineWren).toBeInZone('groundArena');
            // });
        });
    });
});
