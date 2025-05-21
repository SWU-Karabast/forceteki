describe('Impropriety Among Thieves', function () {
    integration(function (contextRef) {
        describe('Impropriety Among Thieves\'s event ability', function () {
            describe('when there are no ready non-leader units in play', function () {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['impropriety-among-thieves'],
                            groundArena: [{ card: 'superlaser-technician', exhausted: true }],
                            leader: { card: 'boba-fett#daimyo', deployed: true },
                        },
                        player2: {
                            groundArena: [{ card: 'seasoned-shoretrooper', exhausted: true }],
                            leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                        }
                    });
                });

                it('does nothing', () => {
                    const { context } = contextRef;

                    context.player1.clickCard(context.improprietyAmongThieves);

                    expect(context.player2).toBeActivePlayer();
                    expect(context.superlaserTechnician).toBeInZone('groundArena', context.player1);
                    expect(context.seasonedShoretrooper).toBeInZone('groundArena', context.player2);
                });
            });

            describe('when there are too few ready non-leader units in play', function () {
                it('does nothing when opponent has no ready non-leader units', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['impropriety-among-thieves'],
                            groundArena: ['battlefield-marine'],
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.improprietyAmongThieves);

                    expect(context.player2).toBeActivePlayer();
                    expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
                });

                it('does nothing when player has no ready non-leader units', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['impropriety-among-thieves']
                        },
                        player2: {
                            groundArena: ['battlefield-marine']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.improprietyAmongThieves);

                    expect(context.player2).toBeActivePlayer();
                    expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);
                });
            });

            describe('when there are ready non-leader units in play', function () {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['impropriety-among-thieves'],
                            groundArena: ['superlaser-technician'],
                            leader: { card: 'boba-fett#daimyo', deployed: true },
                        },
                        player2: {
                            hand: ['waylay', 'vanquish', 'change-of-heart', 'superlaser-blast', 'evacuate'],
                            groundArena: ['seasoned-shoretrooper', { card: 'scanning-officer', exhausted: true }],
                            leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                        }
                    });
                });

                it('exchanges control of the chosen units and returns control at the start of the regroup phase', () => {
                    const { context } = contextRef;

                    context.player1.clickCard(context.improprietyAmongThieves);

                    expect(context.player1).toHavePrompt('Choose a friendly ready non-leader unit');
                    expect(context.player1).toBeAbleToSelectExactly(context.superlaserTechnician);
                    context.player1.clickCard(context.superlaserTechnician);

                    expect(context.player1).toHavePrompt('Choose an enemy ready non-leader unit');
                    expect(context.player1).toBeAbleToSelectExactly(context.seasonedShoretrooper);
                    context.player1.clickCard(context.seasonedShoretrooper);

                    expect(context.player2).toBeActivePlayer();

                    expect(context.superlaserTechnician).toBeInZone('groundArena', context.player2);
                    expect(context.seasonedShoretrooper).toBeInZone('groundArena', context.player1);

                    context.moveToRegroupPhase();

                    expect(context.superlaserTechnician).toBeInZone('groundArena', context.player1);
                    expect(context.seasonedShoretrooper).toBeInZone('groundArena', context.player2);
                });

                it('works if one of the units gets defeated', () => {
                    const { context } = contextRef;

                    // Player 1 plays Impropriety Among Thieves
                    context.player1.clickCard(context.improprietyAmongThieves);

                    // Player 1 chooses to give Player 2 Superlaser Technician
                    expect(context.player1).toHavePrompt('Choose a friendly ready non-leader unit');
                    expect(context.player1).toBeAbleToSelectExactly(context.superlaserTechnician);
                    context.player1.clickCard(context.superlaserTechnician);

                    // Player 1 chooses to take Seasoned Shoretrooper
                    expect(context.player1).toHavePrompt('Choose an enemy ready non-leader unit');
                    expect(context.player1).toBeAbleToSelectExactly(context.seasonedShoretrooper);
                    context.player1.clickCard(context.seasonedShoretrooper);

                    expect(context.player2).toBeActivePlayer();
                    expect(context.superlaserTechnician).toBeInZone('groundArena', context.player2);
                    expect(context.seasonedShoretrooper).toBeInZone('groundArena', context.player1);

                    // Player 2 plays Vanquish to defeat Seasoned Shoretrooper
                    context.player2.clickCard(context.vanquish);
                    context.player2.clickCard(context.seasonedShoretrooper);

                    expect(context.seasonedShoretrooper).toBeInZone('discard', context.player2);

                    context.moveToRegroupPhase();

                    // Superlaser Technician returns to Player 1, but Seasoned Shoretrooper remains in the discard pile
                    expect(context.superlaserTechnician).toBeInZone('groundArena', context.player1);
                    expect(context.seasonedShoretrooper).toBeInZone('discard', context.player2);
                });

                it('works if one of the units is returned to its owner\'s hand', () => {
                    const { context } = contextRef;

                    // Player 1 plays Impropriety Among Thieves
                    context.player1.clickCard(context.improprietyAmongThieves);

                    // Player 1 chooses to give Player 2 Superlaser Technician
                    expect(context.player1).toHavePrompt('Choose a friendly ready non-leader unit');
                    expect(context.player1).toBeAbleToSelectExactly(context.superlaserTechnician);
                    context.player1.clickCard(context.superlaserTechnician);

                    // Player 1 chooses to take Seasoned Shoretrooper
                    expect(context.player1).toHavePrompt('Choose an enemy ready non-leader unit');
                    expect(context.player1).toBeAbleToSelectExactly(context.seasonedShoretrooper);
                    context.player1.clickCard(context.seasonedShoretrooper);

                    expect(context.player2).toBeActivePlayer();
                    expect(context.superlaserTechnician).toBeInZone('groundArena', context.player2);
                    expect(context.seasonedShoretrooper).toBeInZone('groundArena', context.player1);

                    // Player 2 plays Waylay to return Seasoned Shoretrooper to their hand
                    context.player2.clickCard(context.waylay);
                    context.player2.clickCard(context.seasonedShoretrooper);

                    expect(context.seasonedShoretrooper).toBeInZone('hand', context.player2);

                    context.moveToRegroupPhase();

                    // Superlaser Technician returns to Player 1, but Seasoned Shoretrooper remains in the hand
                    expect(context.superlaserTechnician).toBeInZone('groundArena', context.player1);
                    expect(context.seasonedShoretrooper).toBeInZone('hand', context.player2);
                });

                it('works if one of the units changes control again', () => {
                    const { context } = contextRef;

                    // Player 1 plays Impropriety Among Thieves
                    context.player1.clickCard(context.improprietyAmongThieves);

                    // Player 1 chooses to give Player 2 Superlaser Technician
                    expect(context.player1).toHavePrompt('Choose a friendly ready non-leader unit');
                    expect(context.player1).toBeAbleToSelectExactly(context.superlaserTechnician);
                    context.player1.clickCard(context.superlaserTechnician);

                    // Player 1 chooses to take Seasoned Shoretrooper
                    expect(context.player1).toHavePrompt('Choose an enemy ready non-leader unit');
                    expect(context.player1).toBeAbleToSelectExactly(context.seasonedShoretrooper);
                    context.player1.clickCard(context.seasonedShoretrooper);

                    expect(context.player2).toBeActivePlayer();
                    expect(context.superlaserTechnician).toBeInZone('groundArena', context.player2);
                    expect(context.seasonedShoretrooper).toBeInZone('groundArena', context.player1);

                    // Player 2 plays Change of Heart to take control of Seasoned Shoretrooper
                    context.player2.clickCard(context.changeOfHeart);
                    context.player2.clickCard(context.seasonedShoretrooper);

                    expect(context.seasonedShoretrooper).toBeInZone('groundArena', context.player2);

                    context.moveToRegroupPhase();

                    // Superlaser Technician returns to Player 1, but Seasoned Shoretrooper remains with Player 2
                    expect(context.superlaserTechnician).toBeInZone('groundArena', context.player1);
                    expect(context.seasonedShoretrooper).toBeInZone('groundArena', context.player2);
                });

                it('nothing happens at the regroup phase if both units have been defeated', () => {
                    const { context } = contextRef;

                    // Player 1 plays Impropriety Among Thieves
                    context.player1.clickCard(context.improprietyAmongThieves);

                    // Player 1 chooses to give Player 2 Superlaser Technician
                    expect(context.player1).toHavePrompt('Choose a friendly ready non-leader unit');
                    expect(context.player1).toBeAbleToSelectExactly(context.superlaserTechnician);
                    context.player1.clickCard(context.superlaserTechnician);

                    // Player 1 chooses to take Seasoned Shoretrooper
                    expect(context.player1).toHavePrompt('Choose an enemy ready non-leader unit');
                    expect(context.player1).toBeAbleToSelectExactly(context.seasonedShoretrooper);
                    context.player1.clickCard(context.seasonedShoretrooper);

                    expect(context.player2).toBeActivePlayer();
                    expect(context.superlaserTechnician).toBeInZone('groundArena', context.player2);
                    expect(context.seasonedShoretrooper).toBeInZone('groundArena', context.player1);

                    // Player 2 plays Superlaser Blast to defeat all units
                    context.player2.clickCard(context.superlaserBlast);

                    // Put Superlaser Technician into play as a resource
                    expect(context.player2).toHavePassAbilityPrompt('Put Superlaser Technician into play as a resource and ready it');
                    context.player2.clickPrompt('Trigger');

                    expect(context.superlaserTechnician).toBeInZone('resource', context.player2);
                    expect(context.seasonedShoretrooper).toBeInZone('discard', context.player2);

                    context.moveToRegroupPhase();

                    // Nothing changes
                    expect(context.superlaserTechnician).toBeInZone('resource', context.player2);
                    expect(context.seasonedShoretrooper).toBeInZone('discard', context.player2);
                });

                it('nothing happens at the regroup phase if both units have been returned to their owners\' hands', () => {
                    const { context } = contextRef;

                    // Player 1 plays Impropriety Among Thieves
                    context.player1.clickCard(context.improprietyAmongThieves);

                    // Player 1 chooses to give Player 2 Superlaser Technician
                    expect(context.player1).toHavePrompt('Choose a friendly ready non-leader unit');
                    expect(context.player1).toBeAbleToSelectExactly(context.superlaserTechnician);
                    context.player1.clickCard(context.superlaserTechnician);

                    // Player 1 chooses to take Seasoned Shoretrooper
                    expect(context.player1).toHavePrompt('Choose an enemy ready non-leader unit');
                    expect(context.player1).toBeAbleToSelectExactly(context.seasonedShoretrooper);
                    context.player1.clickCard(context.seasonedShoretrooper);

                    expect(context.player2).toBeActivePlayer();
                    expect(context.superlaserTechnician).toBeInZone('groundArena', context.player2);
                    expect(context.seasonedShoretrooper).toBeInZone('groundArena', context.player1);

                    // Player 2 plays Evacuate to return all units to their owners' hands
                    context.player2.clickCard(context.evacuate);

                    expect(context.superlaserTechnician).toBeInZone('hand', context.player1);
                    expect(context.seasonedShoretrooper).toBeInZone('hand', context.player2);

                    context.moveToRegroupPhase();

                    // Nothing changes, both units are still in their owners' hands
                    expect(context.superlaserTechnician).toBeInZone('hand', context.player1);
                    expect(context.seasonedShoretrooper).toBeInZone('hand', context.player2);
                });
            });

            describe('when a unit is taken with traitorous ability', function () {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['impropriety-among-thieves'],
                            groundArena: ['superlaser-technician', 'seasoned-shoretrooper'],
                            leader: { card: 'boba-fett#daimyo', deployed: true },
                        },
                        player2: {
                            hand: ['traitorous'],
                            groundArena: [{ card: 'scanning-officer', exhausted: true }],
                            leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                        }
                    });
                });

                it('returns control of the unit to the owner at the start of the regroup phase', () => {
                    const { context } = contextRef;
                    context.player1.passAction();

                    context.player2.clickCard(context.traitorous);
                    context.player2.clickCard(context.seasonedShoretrooper);
                    context.player1.clickCard(context.improprietyAmongThieves);
                    expect(context.player1).toHavePrompt('Choose a friendly ready non-leader unit');
                    expect(context.player1).toBeAbleToSelectExactly(context.superlaserTechnician);

                    context.player1.clickCard(context.superlaserTechnician);
                    expect(context.player1).toHavePrompt('Choose an enemy ready non-leader unit');
                    expect(context.player1).toBeAbleToSelectExactly(context.seasonedShoretrooper);

                    context.player1.clickCard(context.seasonedShoretrooper);

                    expect(context.player2).toBeActivePlayer();
                    expect(context.superlaserTechnician).toBeInZone('groundArena', context.player2);
                    expect(context.seasonedShoretrooper).toBeInZone('groundArena', context.player1);

                    context.moveToRegroupPhase();

                    expect(context.superlaserTechnician).toBeInZone('groundArena', context.player1);
                    expect(context.seasonedShoretrooper).toBeInZone('groundArena', context.player1);
                });
            });
        });
    });
});
