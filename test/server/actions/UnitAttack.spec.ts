describe('Basic attack', function() {
    integration(function(contextRef) {
        describe('When a unit attacks', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    // TODO: helper function for automatically selecting a leader and / or base that match the aspects of the card under test
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer'],
                        base: 'kestro-city'
                    },
                    player2: {
                        groundArena: ['frontier-atrt', 'enfys-nest#marauder'],
                        spaceArena: ['alliance-xwing'],
                        base: 'jabbas-palace'
                    }
                });
            });

            it('the player should only be able to select opponent\'s units in the same arena and base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                expect(context.player1).toHavePrompt('Choose a target for attack');
                expect(context.player1).toHaveEnabledPromptButton('Cancel');

                // can target opponent's ground units and base but not space units
                expect(context.player1).toBeAbleToSelectExactly([context.frontierAtrt, context.enfysNest, context.p2Base]);
                context.player1.clickCard(context.p2Base);
            });

            it('the player should be able to cancel the attack and then trigger it again', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                expect(context.player1).toHavePrompt('Choose a target for attack');
                expect(context.player1).toHaveEnabledPromptButton('Cancel');

                context.player1.clickPrompt('Cancel');
                expect(context.player1).toBeActivePlayer();
                context.player1.clickCard(context.wampa);
                expect(context.player1).toHavePrompt('Choose a target for attack');

                // can target opponent's ground units and base but not space units
                expect(context.player1).toBeAbleToSelectExactly([context.frontierAtrt, context.enfysNest, context.p2Base]);
                context.player1.clickCard(context.p2Base);
            });

            it('from space arena to another unit in the space arena, attack should resolve correctly', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.allianceXwing);

                // attack against base should immediately resolve without prompt for a target, since only one is available
                expect(context.cartelSpacer.damage).toBe(2);
                expect(context.cartelSpacer.exhausted).toBe(true);
                expect(context.allianceXwing.damage).toBe(2);
                expect(context.allianceXwing.exhausted).toBe(false);

                expect(context.getChatLogs(2)).toContain('Cartel Spacer attacks Alliance X-Wing');
            });

            it('another unit and neither is defeated, both should receive damage and attacker should be exhausted', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.frontierAtrt);

                expect(context.wampa.damage).toBe(3);
                expect(context.frontierAtrt.damage).toBe(4);
                expect(context.wampa.exhausted).toBe(true);
                expect(context.frontierAtrt.exhausted).toBe(false);
            });

            it('another unit and both are defeated, both should be in discard', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.enfysNest);

                expect(context.wampa).toBeInZone('discard');
                expect(context.enfysNest).toBeInZone('discard');
            });

            it('another unit and both are defeated, both should be in discard', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.enfysNest);

                expect(context.wampa).toBeInZone('discard');
                expect(context.enfysNest).toBeInZone('discard');
            });

            it('base with non-lethal damage, base should be damaged and attacker should be exhausted', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                expect(context.wampa.damage).toBe(0);
                expect(context.wampa.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(4);
            });

            it('base with lethal damage, game should end immediately', function () {
                const { context } = contextRef;

                context.setDamage(context.p2Base, 28);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                // we still expect this since it should've been done before the attack
                expect(context.wampa.exhausted).toBe(true);

                expect(context.p2Base.damage).toBe(30);
                expect(context.player1).toHavePrompt('player1 has won the game!');
                expect(context.player2).toHavePrompt('player1 has won the game!');
                expect(context.player1).toBeActivePlayer();

                context.ignoreUnresolvedActionPhasePrompts = true;
            });
        });

        it('When a unit attacks as part of an ability, it should not have a cancel button', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fleet-lieutenant'],
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fleetLieutenant);
            expect(context.fleetLieutenant).toBeInZone('groundArena');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);

            context.player1.clickCard(context.wampa);
            expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);
            expect(context.player1).not.toHaveEnabledPromptButton('Cancel');

            context.player1.clickCard(context.p2Base);
            expect(context.wampa.exhausted).toBe(true);
            expect(context.wampa.damage).toBe(0);
            expect(context.p2Base.damage).toBe(4);
        });

        it('When the defender changes controller during the attack, the attack should halt', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sneak-attack', 'daring-raid', 'specforce-soldier'],
                    groundArena: ['poe-dameron#quick-to-improvise', 'battlefield-marine'],
                },
                player2: {
                    hand: ['traitorous'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.traitorous);
            context.player2.clickCard(context.battlefieldMarine);

            context.player1.clickCard(context.poeDameron);
            context.player1.clickCard(context.battlefieldMarine);

            // Discard selection for Poe ability
            context.player1.clickCard(context.sneakAttack);
            context.player1.clickPrompt('Done');

            context.player1.clickPrompt('Defeat an upgrade.');
            context.player1.clickCard(context.traitorous);

            expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
            expect(context.poeDameron.damage).toBe(0);
        });
    });
});

