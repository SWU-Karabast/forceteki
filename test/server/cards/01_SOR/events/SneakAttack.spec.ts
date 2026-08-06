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
                expect(context.getChatLogs(2)).toContain('player1 uses a delayed effect applied by Sneak Attack to defeat Sabine Wren');
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

                context.moveToRegroupPhase();

                expect(context.getChatLogs(1)).toEqual(['Round: 1 - Regroup Phase']);
            });

            it('should not bug if the unit is defeated because of the uniqueness rule', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sneak-attack', 'sabine-wren#you-can-count-on-me', 'obiwan-kenobi#following-fate', 'recruit'],
                        groundArena: ['battlefield-marine', { card: 'sabine-wren#you-can-count-on-me', exhausted: true }],
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

                const p1Sabines = context.player1.findCardsByName('sabine-wren#you-can-count-on-me');
                context.sabineInHand = p1Sabines.find((sabine) => sabine.zoneName === 'hand');
                context.sabineInPlay = p1Sabines.find((sabine) => sabine.zoneName === 'groundArena');

                context.player1.clickCard(context.sneakAttack);
                context.player1.clickCard(context.sabineInHand);
                context.player1.clickCard(context.sabineInHand); // Choose to defeat the one played with Sneak Attack
                expect(context.sabineInHand).toBeInZone('discard');
                expect(context.sabineInPlay).toBeInZone('groundArena');

                context.moveToRegroupPhase();
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

            // Ruling 2025-03-25: a unit played with Sneak Attack is defeated at the start of the
            // regroup phase as long as it's still in play. Attaching it as a pilot upgrade (e.g. via
            // Corvus) does not remove it from play, so the delayed effect still defeats it.
            it('should defeat a unit played via Sneak Attack that was attached as a pilot upgrade before regroup', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sneak-attack', 'iden-versio#adapt-or-die', 'corvus#inferno-squadron-raider'],
                        base: 'administrators-tower',
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        resources: 12
                    },
                    player2: {}
                });

                const { context } = contextRef;

                // Play Iden (a Pilot unit) via Sneak Attack
                context.player1.clickCard(context.sneakAttack);
                context.player1.clickCard(context.idenVersio);
                expect(context.idenVersio).toBeInZone('groundArena');

                context.player2.passAction();

                // Play Corvus and use its When Played to attach Iden as a pilot upgrade
                context.player1.clickCard(context.corvus);
                context.player1.clickCard(context.idenVersio);
                expect(context.idenVersio.parentCard).toBe(context.corvus); // Iden is now an upgrade on Corvus

                // At the start of the regroup phase, Iden is still in play (as an upgrade) and is
                // defeated by Sneak Attack's delayed effect
                context.moveToRegroupPhase();
                expect(context.idenVersio).toBeInZone('discard');
            });

            it('should not defeat Sabine if she is waylay back in hand and played back the same phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sneak-attack', 'sabine-wren#you-can-count-on-me', 'recruit'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                        base: 'administrators-tower',
                        leader: 'luke-skywalker#faithful-friend',
                    },
                    player2: {
                        hand: ['waylay']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sneakAttack);
                context.player1.clickCard(context.sabineWren);

                // Waylay Sabine back in hand
                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.sabineWren);

                // Sabine is played back
                context.player1.clickCard(context.sabineWren);
                context.nextPhase();
                expect(context.sabineWren).toBeInZone('groundArena');
            });

            // Ruling 2026-05-06: the start of the regroup phase is a single moment in time. If a unit
            // is rescued at that moment (because Sneak Attack's delayed effect defeats the guarding
            // unit), it is not in play in time to see the "when the regroup phase starts" trigger window,
            // so its own start-of-regroup ability does not trigger.
            xit('does not trigger a rescued unit\'s "when the regroup phase starts" ability when it is freed at regroup start', function () {
                // Play Discerning Veteran via Sneak Attack, capturing an enemy Contracted Hunter. At the
                // start of the regroup phase, Sneak Attack's delayed effect defeats Discerning Veteran,
                // rescuing Contracted Hunter at that same moment. Contracted Hunter's "When the regroup
                // phase starts: Defeat this unit" does NOT trigger, since it was not in play to see it.
            });
        });
    });
});
