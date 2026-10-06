describe('Cost payment recovery', function() {
    undoIntegration(function(contextRef) {
        // Queen Amidala and The Starhawk share the Mandalorian trait from Foundling, so Queen Amidala can defeat The Starhawk to
        // prevent damage from The Marauder. The Marauder costs 7 - 1 = 6, which can only be paid if The Starhawk halves it to 3.
        const setupQueenAmidalaAndStarhawkAsync = async (enableConfirmationToUndo = false) => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'hera-syndulla#spectre-two',
                    hand: ['the-marauder#a-new-home'],
                    groundArena: ['battlefield-marine', { card: 'queen-amidala#championing-her-people', upgrades: ['foundling'] }],
                    spaceArena: [{ card: 'the-starhawk#prototype-battleship', upgrades: ['foundling'] }],
                    resources: 3
                },
                enableConfirmationToUndo
            });
        };

        const playMarauderAndDefeatStarhawkWithQueenAmidala = () => {
            const { context } = contextRef;

            context.player1.clickCard(context.theMarauder);
            context.player1.clickCard(context.queenAmidala);
            context.player1.clickPrompt('Done');
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.theStarhawk);
        };

        const expectStateAtStartOfAction = () => {
            const { context } = contextRef;

            expect(context.player1).toBeActivePlayer();
            expect(context.theMarauder).toBeInZone('hand');
            expect(context.theStarhawk).toBeInZone('spaceArena');
            expect(context.queenAmidala.damage).toBe(0);
            expect(context.player1.readyResourceCount).toBe(3);
        };

        it('lets the player undo to the start of the action if a replacement effect makes the cost unpayable', async function() {
            await setupQueenAmidalaAndStarhawkAsync();
            const { context } = contextRef;

            playMarauderAndDefeatStarhawkWithQueenAmidala();

            // without The Starhawk's discount, the remaining cost of 6 can't be paid
            expect(context.theStarhawk).toBeInZone('discard');
            expect(context.player1).toHavePrompt('You can no longer pay the cost for The Marauder');
            expect(context.player1).toHaveExactPromptButtons(['Undo']);
            expect(context.getChatLogs(1)[0]).toContain('player1 is no longer able to pay the cost for The Marauder: the remaining cost after discounts is 6 resources, but they only have 3 ready resources');

            context.player1.clickPrompt('Undo');
            expectStateAtStartOfAction();

            // this time, let the damage to Queen Amidala happen
            context.player1.clickCard(context.theMarauder);
            context.player1.clickCard(context.queenAmidala);
            context.player1.clickPrompt('Done');
            context.player1.clickPrompt('Pass');

            expect(context.theMarauder).toBeInZone('spaceArena');
            expect(context.queenAmidala.damage).toBe(1);
            expect(context.theStarhawk).toBeInZone('spaceArena');
            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });

        it('lets the player undo if the damage defeats a chosen unit that was providing a cost adjustment', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'hera-syndulla#spectre-two',
                    hand: ['the-marauder#a-new-home'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: [{ card: 'the-starhawk#prototype-battleship', damage: 8 }],
                    resources: 3
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theMarauder);
            context.player1.clickCard(context.theStarhawk);
            context.player1.clickPrompt('Done');

            expect(context.theStarhawk).toBeInZone('discard');
            expect(context.player1).toHavePrompt('You can no longer pay the cost for The Marauder');
            expect(context.player1).toHaveExactPromptButtons(['Undo']);

            context.player1.clickPrompt('Undo');

            expect(context.player1).toBeActivePlayer();
            expect(context.theMarauder).toBeInZone('hand');
            expect(context.theStarhawk).toBeInZone('spaceArena');
            expect(context.theStarhawk.damage).toBe(8);
            expect(context.player1.readyResourceCount).toBe(3);

            context.player1.clickCard(context.theMarauder);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickPrompt('Done');

            expect(context.theMarauder).toBeInZone('spaceArena');
            expect(context.theStarhawk).toBeInZone('spaceArena');
            expect(context.player1.exhaustedResourceCount).toBe(3);
        });

        it('lets the player undo if the cost becomes unpayable at a targeted cost adjustment stage', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'hera-syndulla#spectre-two',
                    hand: ['the-marauder#a-new-home'],
                    groundArena: [
                        { card: 'queen-amidala#championing-her-people', upgrades: ['foundling'] },
                        { card: 'super-battle-droid', upgrades: ['foundling'] }
                    ],
                    spaceArena: ['vuutun-palaa#droid-control-ship'],
                    resources: 5
                }
            });

            const { context } = contextRef;

            // The Marauder costs 7 - 1 = 6, which can only be paid by exhausting Super Battle Droid with Vuutun Palaa
            context.player1.clickCard(context.theMarauder);
            context.player1.clickCard(context.queenAmidala);
            context.player1.clickPrompt('Done');
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.superBattleDroid);

            expect(context.superBattleDroid).toBeInZone('discard');
            expect(context.player1).toHavePrompt('You can no longer pay the cost for The Marauder');
            expect(context.player1).toHaveExactPromptButtons(['Undo']);
            expect(context.getChatLogs(1)[0]).toContain('player1 is no longer able to pay the cost for The Marauder: the remaining cost after discounts is 6 resources, but they only have 5 ready resources');

            context.player1.clickPrompt('Undo');

            expect(context.player1).toBeActivePlayer();
            expect(context.theMarauder).toBeInZone('hand');
            expect(context.superBattleDroid).toBeInZone('groundArena');
            expect(context.player1.readyResourceCount).toBe(5);
        });

        it('lets the player undo as many times as needed', async function() {
            await setupQueenAmidalaAndStarhawkAsync();
            const { context } = contextRef;

            playMarauderAndDefeatStarhawkWithQueenAmidala();
            context.player1.clickPrompt('Undo');
            expectStateAtStartOfAction();

            playMarauderAndDefeatStarhawkWithQueenAmidala();
            expect(context.player1).toHaveExactPromptButtons(['Undo']);
            context.player1.clickPrompt('Undo');
            expectStateAtStartOfAction();
        });

        it('does not require confirmation to undo, even if the player has used their free undo', async function() {
            await setupQueenAmidalaAndStarhawkAsync(true);
            const { context } = contextRef;

            // use up player1's free undo
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);
            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).not.toHaveConfirmUndoPrompt();
            expect(context.battlefieldMarine.exhausted).toBeFalse();

            playMarauderAndDefeatStarhawkWithQueenAmidala();
            context.player1.clickPrompt('Undo');

            expect(context.player2).not.toHaveConfirmUndoPrompt();
            expectStateAtStartOfAction();
        });

        it('does not use up the player\'s free undo', async function() {
            await setupQueenAmidalaAndStarhawkAsync(true);
            const { context } = contextRef;

            playMarauderAndDefeatStarhawkWithQueenAmidala();
            context.player1.clickPrompt('Undo');
            expectStateAtStartOfAction();

            // the player's free undo is still available
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);
            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).not.toHaveConfirmUndoPrompt();
            expect(context.battlefieldMarine.exhausted).toBeFalse();
            expect(context.p2Base.damage).toBe(0);
        });

        describe('if information was revealed earlier in the action', function() {
            // Kelleran Beq costs 7, halved by The Starhawk to 4. The Marauder is then played from the deck search for 7 - 3 = 4,
            // halved to 2. Choosing Queen Amidala isn't needed, but if she defeats The Starhawk the remaining cost of 3 can't be paid.
            const setupKelleranBeqAsync = async (enableConfirmationToUndo) => {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['kelleran-beq#the-sabered-hand'],
                        deck: ['the-marauder#a-new-home', 'wampa', 'porg', 'battlefield-marine', 'pyke-sentinel', 'atst', 'cartel-spacer', 'death-star-stormtrooper'],
                        groundArena: [{ card: 'queen-amidala#championing-her-people', upgrades: ['foundling'] }],
                        spaceArena: [{ card: 'the-starhawk#prototype-battleship', upgrades: ['foundling'] }],
                        resources: 6
                    },
                    enableConfirmationToUndo
                });
            };

            const playMarauderFromKelleranBeqAndDefeatStarhawk = () => {
                const { context } = contextRef;

                context.player1.clickCard(context.kelleranBeq);
                context.player1.clickCardInDisplayCardPrompt(context.theMarauder);
                context.player1.clickCard(context.queenAmidala);
                context.player1.clickPrompt('Done');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.theStarhawk);
            };

            it('requires the opponent to approve the undo', async function() {
                await setupKelleranBeqAsync(true);
                const { context } = contextRef;

                playMarauderFromKelleranBeqAndDefeatStarhawk();

                // the deck search revealed cards, so undoing to the start of the action requires approval
                expect(context.player1).toHavePrompt('You can no longer pay the cost for The Marauder');
                expect(context.player1).toHaveExactPromptButtons(['Request undo']);
                context.player1.clickPrompt('Request undo');

                expect(context.player2).toHaveConfirmUndoPrompt();
                context.player2.clickPrompt('Allow');

                expect(context.player1).toBeActivePlayer();
                expect(context.kelleranBeq).toBeInZone('hand');
                expect(context.theStarhawk).toBeInZone('spaceArena');
                expect(context.player1.readyResourceCount).toBe(6);
            });

            it('does not require approval if undo requests are not needed in the game', async function() {
                await setupKelleranBeqAsync(false);
                const { context } = contextRef;

                playMarauderFromKelleranBeqAndDefeatStarhawk();

                expect(context.player1).toHaveExactPromptButtons(['Undo']);
                context.player1.clickPrompt('Undo');

                expect(context.player1).toBeActivePlayer();
                expect(context.kelleranBeq).toBeInZone('hand');
                expect(context.theStarhawk).toBeInZone('spaceArena');
            });
        });

        describe('with a custom recovery policy', function() {
            it('can require the opponent to approve the undo', async function() {
                await setupQueenAmidalaAndStarhawkAsync(true);
                const { context } = contextRef;

                context.game.costPaymentRecoveryPolicy = {
                    allowRollback: () => true,
                    rollbackRequiresApproval: () => true,
                    allowAbandon: () => false
                };

                // use up player1's free undo
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                contextRef.snapshot.quickRollback(context.player1.id);

                playMarauderAndDefeatStarhawkWithQueenAmidala();
                expect(context.player1).toHaveExactPromptButtons(['Request undo']);
                context.player1.clickPrompt('Request undo');

                expect(context.player2).toHaveConfirmUndoPrompt();
                context.player2.clickPrompt('Allow');

                expectStateAtStartOfAction();
            });

            it('abandons the payment, keeping the costs already paid, if the opponent denies the undo', async function() {
                await setupQueenAmidalaAndStarhawkAsync(true);
                const { context } = contextRef;

                context.game.costPaymentRecoveryPolicy = {
                    allowRollback: () => true,
                    rollbackRequiresApproval: () => true,
                    allowAbandon: () => false
                };

                // use up player1's free undo
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                contextRef.snapshot.quickRollback(context.player1.id);

                playMarauderAndDefeatStarhawkWithQueenAmidala();
                context.player1.clickPrompt('Request undo');

                expect(context.player2).toHaveConfirmUndoPrompt();
                context.player2.clickPrompt('Deny');

                expect(context.theMarauder).toBeInZone('hand');
                expect(context.theStarhawk).toBeInZone('discard');
                expect(context.player1.readyResourceCount).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('can offer abandoning the payment instead of undoing', async function() {
                await setupQueenAmidalaAndStarhawkAsync();
                const { context } = contextRef;

                context.game.costPaymentRecoveryPolicy = {
                    allowRollback: () => false,
                    rollbackRequiresApproval: () => false,
                    allowAbandon: () => true
                };

                playMarauderAndDefeatStarhawkWithQueenAmidala();

                expect(context.player1).toHavePrompt('You can no longer pay the cost for The Marauder');
                expect(context.player1).toHaveExactPromptButtons(['Abandon']);
                context.player1.clickPrompt('Abandon');

                // The Marauder isn't played, but the damage and defeats from paying the cost are not reversed, and the action is used
                expect(context.theMarauder).toBeInZone('hand');
                expect(context.theStarhawk).toBeInZone('discard');
                expect(context.player1.readyResourceCount).toBe(3);
                expect(context.getChatLogs(1)[0]).toContain('player1 abandons playing The Marauder. Costs already paid are not refunded');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
