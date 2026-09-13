describe('Luminara Unduli, Besieged General', function() {
    integration(function(contextRef) {
        describe('Luminara\'s ability', function() {
            it('should attack with a unit and give it +2/+0 for the attack when she gets played', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['luminara-unduli#besieged-general'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.luminaraUnduli);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cartelSpacer]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(5);
                expect(context.battlefieldMarine.getPower()).toBe(3);
            });

            it('should be able to be passed when she gets played', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['luminara-unduli#besieged-general'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.luminaraUnduli);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cartelSpacer]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(0);
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.cartelSpacer.getPower()).toBe(2);
            });

            it('should attack with a unit and give it +2/+0 for the attack when another unit gets played', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['lurking-tie-phantom'],
                        groundArena: ['battlefield-marine', 'luminara-unduli#besieged-general'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lurkingTiePhantom);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cartelSpacer, context.luminaraUnduli]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(5);
                expect(context.battlefieldMarine.getPower()).toBe(3);
            });

            it('should be able to be passed when another unit gets played', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['lurking-tie-phantom'],
                        groundArena: ['battlefield-marine', 'luminara-unduli#besieged-general'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lurkingTiePhantom);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cartelSpacer, context.luminaraUnduli]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(0);
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.cartelSpacer.getPower()).toBe(2);
                expect(context.luminaraUnduli.getPower()).toBe(7);
            });

            it('should not trigger when an opponent plays a unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', 'luminara-unduli#besieged-general'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        hand: ['lurking-tie-phantom'],
                        groundArena: ['rebel-pathfinder'],
                        hasInitiative: true
                    },
                });

                const { context } = contextRef;

                context.player2.clickCard(context.lurkingTiePhantom);

                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(0);
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.cartelSpacer.getPower()).toBe(2);
                expect(context.luminaraUnduli.getPower()).toBe(7);
                expect(context.rebelPathfinder.getPower()).toBe(2);
            });

            it('should not trigger off token creation', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['stronger-together'],
                        groundArena: ['battlefield-marine', 'luminara-unduli#besieged-general'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.strongerTogether);
                context.player1.clickPrompt('Resolve all (2)');

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(0);
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.cartelSpacer.getPower()).toBe(2);
                expect(context.luminaraUnduli.getPower()).toBe(7);
            });
        });

        describe('Luminara\'s ability with Maul, Old Master', function() {
            it('should still trigger when she is the unit Maul plays and defeats', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maul#old-master',
                        hand: ['luminara-unduli#besieged-general'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                        resources: 20
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder']
                    },
                });

                const { context } = contextRef;

                // Maul plays Luminara and immediately defeats her
                context.player1.clickCard(context.maul);
                context.player1.clickPrompt('Play a unit from your hand. It costs 1 resource less. Then, defeat it.');
                context.player1.clickCard(context.luminaraUnduli);
                expect(context.luminaraUnduli).toBeInZone('discard');

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cartelSpacer]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(5);
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should still trigger when she is already in play and Maul plays and defeats another unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maul#old-master',
                        hand: ['wampa'],
                        groundArena: ['luminara-unduli#besieged-general', 'battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                        resources: 20
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.maul);
                context.player1.clickPrompt('Play a unit from your hand. It costs 1 resource less. Then, defeat it.');
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard');

                expect(context.player1).toBeAbleToSelectExactly([context.luminaraUnduli, context.battlefieldMarine, context.cartelSpacer]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.luminaraUnduli);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(9);
                expect(context.luminaraUnduli.getPower()).toBe(7);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
