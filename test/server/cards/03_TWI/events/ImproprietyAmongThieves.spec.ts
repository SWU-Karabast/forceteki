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
                    context.player1.clickPrompt('Play anyway');

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
                    context.player1.clickPrompt('Play anyway');

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
                    context.player1.clickPrompt('Play anyway');

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

        describe('Impropriety Among Thieves\'s interaction with Pilot leaders', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-vader#victor-squadron-leader',
                        base: 'mos-eisley',
                        hand: ['impropriety-among-thieves'],
                        spaceArena: [
                            'hotshot-vwing'
                        ]
                    },
                    player2: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        spaceArena: [
                            'millennium-falcon#piece-of-junk',
                        ]
                    }
                });
            });

            it('fizzles if the units are piloted leader units', function () {
                const { context } = contextRef;

                // Player 1 deploys Darth Vader to pilot the Hotshot V-Wing
                context.player1.clickCard(context.darthVader);
                context.player1.clickPrompt('Deploy Darth Vader as a Pilot');
                context.player1.clickCard(context.hotshotVwing);

                expect(context.hotshotVwing).toHaveExactUpgradeNames(['darth-vader#victor-squadron-leader']);
                expect(context.hotshotVwing.isLeader()).toBeTrue();

                // Player 2 deploys Kazuda Xiono to pilot the Millennium Falcon
                context.player2.clickCard(context.kazudaXiono);
                context.player2.clickPrompt('Deploy Kazuda Xiono as a Pilot');
                context.player2.clickCard(context.millenniumFalcon);

                expect(context.millenniumFalcon).toHaveExactUpgradeNames(['kazuda-xiono#best-pilot-in-the-galaxy']);
                expect(context.millenniumFalcon.isLeader()).toBeTrue();

                // Player 1 plays Impropriety Among Thieves, but it has no effect
                context.player1.clickCard(context.improprietyAmongThieves);
                context.player1.clickPrompt('Play anyway');

                expect(context.hotshotVwing).toHaveExactUpgradeNames(['darth-vader#victor-squadron-leader']);
                expect(context.millenniumFalcon).toHaveExactUpgradeNames(['kazuda-xiono#best-pilot-in-the-galaxy']);
                expect(context.player2).toBeActivePlayer();
            });

            it('defeats the units if they become leader units after control changes', function () {
                const { context } = contextRef;

                // Player 1 plays Impropriety Among Thieves
                context.player1.clickCard(context.improprietyAmongThieves);

                // Player 1 chooses to give Player 2 Hotshot V-Wing
                expect(context.player1).toHavePrompt('Choose a friendly ready non-leader unit');
                expect(context.player1).toBeAbleToSelectExactly(context.hotshotVwing);
                context.player1.clickCard(context.hotshotVwing);

                // Player 1 chooses to take Millennium Falcon
                expect(context.player1).toHavePrompt('Choose an enemy ready non-leader unit');
                expect(context.player1).toBeAbleToSelectExactly(context.millenniumFalcon);
                context.player1.clickCard(context.millenniumFalcon);

                expect(context.hotshotVwing).toBeInZone('spaceArena', context.player2);
                expect(context.millenniumFalcon).toBeInZone('spaceArena', context.player1);

                // Player 2 deploys Kazuda Xiono to pilot the Hotshot V-Wing
                context.player2.clickCard(context.kazudaXiono);
                context.player2.clickPrompt('Deploy Kazuda Xiono as a Pilot');
                context.player2.clickCard(context.hotshotVwing);

                expect(context.hotshotVwing).toHaveExactUpgradeNames(['kazuda-xiono#best-pilot-in-the-galaxy']);
                expect(context.hotshotVwing.isLeader()).toBeTrue();

                // Player 1 deploys Darth Vader to pilot the Millennium Falcon
                context.player1.clickCard(context.darthVader);
                context.player1.clickPrompt('Deploy Darth Vader as a Pilot');
                context.player1.clickCard(context.millenniumFalcon);

                expect(context.millenniumFalcon).toHaveExactUpgradeNames(['darth-vader#victor-squadron-leader']);
                expect(context.millenniumFalcon.isLeader()).toBeTrue();

                // Move to regroup phase
                context.moveToRegroupPhase();

                // Both units are defeated instead of returning to their owners
                expect(context.hotshotVwing).toBeInZone('discard', context.player1);
                expect(context.millenniumFalcon).toBeInZone('discard', context.player2);
                expect(context.darthVader).toBeInZone('base', context.player1);
                expect(context.kazudaXiono).toBeInZone('base', context.player2);
                expect(context.darthVader.exhausted).toBeTrue();
                expect(context.kazudaXiono.exhausted).toBeTrue();
            });
        });
    });
});
