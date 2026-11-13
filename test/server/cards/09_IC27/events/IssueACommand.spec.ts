describe('Issue a Command', function() {
    integration(function(contextRef) {
        describe('Issue a Command\'s event ability', function() {
            it('should draw a revealed unit, give an Experience token to a friendly unit, and resource itself', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['issue-a-command'],
                        groundArena: ['battlefield-marine', 'battle-droid'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'cassian-andor#dedicated-to-the-rebellion', deployed: true },
                        deck: ['wampa']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                // Play Issue a Command and reveal the top card
                context.player1.clickCard(context.issueACommand);
                expect(context.player2).toHavePrompt('View cards for Issue a Command ability');
                expect(context.player1).toHavePrompt('Waiting for opponent to finish viewing cards for Issue a Command ability');
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.wampa]);
                context.player2.clickDone();

                // Revealed unit is drawn, choose a friendly unit for Experience
                expect(context.wampa).toBeInZone('hand');
                expect(context.player1).toHavePrompt('Give an Experience token to a friendly unit');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cartelSpacer, context.battleDroid, context.cassianAndorDedicatedToTheRebellion]);
                context.player1.clickCard(context.battlefieldMarine);

                // Experience is given and the event is resourced
                expect(context.getChatLogs(2)).toEqual([
                    'player1 plays Issue a Command to reveal and draw Wampa, then to give an Experience token to a friendly unit, and then to move Issue a Command to their resources',
                    'player1 uses Issue a Command to give an Experience token to Battlefield Marine'
                ]);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
                expect(context.issueACommand).toBeInZone('resource');
                expect(context.issueACommand.exhausted).toBeTrue();
                expect(context.player1.discard.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should leave a revealed non-unit on top of the deck, still give an Experience token, and resource itself', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['issue-a-command'],
                        groundArena: ['battlefield-marine'],
                        deck: ['resupply', 'wampa']
                    }
                });

                const { context } = contextRef;
                const handSizeAfterPlaying = context.player1.handSize - 1;

                // Play Issue a Command and reveal the top card
                context.player1.clickCard(context.issueACommand);
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.resupply]);
                context.player2.clickDone();

                // Give Experience to the friendly unit
                context.player1.clickCard(context.battlefieldMarine);

                // Non-unit stays on top of the deck, Experience is given, event is resourced
                expect(context.getChatLogs(2)).toEqual([
                    'player1 plays Issue a Command to reveal Resupply, then to give an Experience token to a friendly unit, and then to move Issue a Command to their resources',
                    'player1 uses Issue a Command to give an Experience token to Battlefield Marine'
                ]);
                expect(context.resupply).toBeInZone('deck');
                expect(context.player1.deck[0]).toBe(context.resupply);
                expect(context.player1.handSize).toBe(handSizeAfterPlaying);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
                expect(context.issueACommand).toBeInZone('resource');
                expect(context.issueACommand.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should still draw the revealed unit and resource itself when there are no friendly units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['issue-a-command'],
                        deck: ['wampa']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                // Play Issue a Command and dismiss the reveal
                context.player1.clickCard(context.issueACommand);
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.wampa]);
                context.player2.clickDone();

                // Unit is drawn, no Experience is given, event is resourced
                expect(context.getChatLogs(1)).toEqual([
                    'player1 plays Issue a Command to reveal and draw Wampa and then to move Issue a Command to their resources'
                ]);
                expect(context.wampa).toBeInZone('hand');
                expect(context.atst).toHaveExactUpgradeNames([]);
                expect(context.issueACommand).toBeInZone('resource');
                expect(context.issueACommand.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should still give an Experience token and resource itself when the deck is empty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['issue-a-command'],
                        groundArena: ['battlefield-marine'],
                        deck: []
                    }
                });

                const { context } = contextRef;

                // Play Issue a Command; nothing is revealed, so it goes straight to choosing a unit for Experience
                context.player1.clickCard(context.issueACommand);
                context.player1.clickCard(context.battlefieldMarine);

                // Experience is given, nothing is drawn, event is resourced
                expect(context.getChatLogs(2)).toEqual([
                    'player1 plays Issue a Command to give an Experience token to a friendly unit and then to move Issue a Command to their resources',
                    'player1 uses Issue a Command to give an Experience token to Battlefield Marine'
                ]);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
                expect(context.p1Base.damage).toBe(0);
                expect(context.player1.handSize).toBe(0);
                expect(context.issueACommand).toBeInZone('resource');
                expect(context.issueACommand.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should still resource itself when the deck is empty and there are no friendly units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['issue-a-command'],
                        deck: []
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                // Play Issue a Command
                context.player1.clickCard(context.issueACommand);

                // Nothing is revealed or given Experience, event is resourced with no "will have no effect" warning
                expect(context.getChatLogs(1)).toEqual([
                    'player1 plays Issue a Command to move Issue a Command to their resources'
                ]);
                expect(context.atst).toHaveExactUpgradeNames([]);
                expect(context.p1Base.damage).toBe(0);
                expect(context.issueACommand).toBeInZone('resource');
                expect(context.issueACommand.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
