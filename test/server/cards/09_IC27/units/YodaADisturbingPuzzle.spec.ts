describe('Yoda, A Disturbing Puzzle', function() {
    integration(function(contextRef) {
        const preventionTitle = 'Prevent all combat damage that would be dealt to and dealt by this unit';

        // The damage dealt to and the damage dealt by the chosen unit are two simultaneous replacements of the
        // same gained ability, so its controller is asked to resolve the grouped triggers
        function resolveBothPreventions(player) {
            expect(player).toHavePrompt(`Resolve "${preventionTitle}"`);
            expect(player).toHaveExactPromptButtons(['Resolve next', 'Resolve all (2)']);
            player.clickPrompt('Resolve all (2)');
        }

        describe('Yoda\'s On Attack ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid'],
                        groundArena: ['yoda#a-disturbing-puzzle', 'wampa']
                    },
                    player2: {
                        hand: ['strike-true'],
                        groundArena: ['battlefield-marine', 'consular-security-force'],
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            it('should prevent all combat damage dealt to and by the defender when it is the chosen unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePrompt('Prevent all combat damage that would be dealt to and dealt by an enemy unit for this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.consularSecurityForce, context.tielnFighter]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);
                resolveBothPreventions(context.player2);

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.yoda.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();

                // the chosen unit's controller resolves the prevention, but it is Yoda's controller's effect.
                // each message names the unit the damage would have been dealt to
                expect(context.getChatLogs(2)).toEqual(jasmine.arrayWithExactContents([
                    'player1 uses Yoda\'s effect to prevent all damage to Battlefield Marine',
                    'player1 uses Yoda\'s effect to prevent all damage to Yoda'
                ]));
            });

            it('should deal combat damage normally if the ability is declined', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.yoda.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should prevent combat damage dealt by the chosen unit when it attacks later in the phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.p2Base.damage).toBe(3);

                // The chosen unit attacks Yoda: no combat damage either way
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.yoda);
                resolveBothPreventions(context.player2);

                expect(context.yoda.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);

                context.player1.passAction();

                // Another enemy unit is not affected
                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.yoda);

                expect(context.yoda.damage).toBe(3);
                expect(context.consularSecurityForce.damage).toBe(3);
            });

            it('should prevent combat damage dealt by the chosen unit to a base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(0);
                expect(context.player1).toBeActivePlayer();
            });

            it('should prevent combat damage dealt to the chosen unit when another unit attacks it, with no Overwhelm damage to the base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.p2Base.damage).toBe(3);

                context.player2.passAction();

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);
                resolveBothPreventions(context.player2);

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.p2Base.damage).toBe(3);
            });

            it('should not prevent non-combat damage dealt to or by the chosen unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.battlefieldMarine);

                // The chosen unit deals ability damage to Yoda
                context.player2.clickCard(context.strikeTrue);
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.yoda);

                expect(context.yoda.damage).toBe(3);

                // Ability damage is dealt to the chosen unit
                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.damage).toBe(2);
            });

            it('should end at the end of the phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.p2Base.damage).toBe(3);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.wampa.damage).toBe(3);
                expect(context.p2Base.damage).toBe(4);
            });
        });

        describe('Yoda\'s prevention and ability damage during an attack', function() {
            it('should not prevent the chosen unit\'s own On Attack ability damage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['yoda#a-disturbing-puzzle']
                    },
                    player2: {
                        groundArena: ['benthic-two-tubes#the-war-has-just-begun']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.benthicTwoTubes);

                // The chosen unit attacks Yoda and its On Attack ping targets him
                context.player2.clickCard(context.benthicTwoTubes);
                context.player2.clickCard(context.yoda);
                expect(context.player2).toBeAbleToSelectExactly([context.yoda]);
                context.player2.clickCard(context.yoda);
                resolveBothPreventions(context.player2);

                // Only the ability damage lands, the combat damage is prevented both ways
                expect(context.yoda.damage).toBe(1);
                expect(context.benthicTwoTubes.damage).toBe(0);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not prevent another unit\'s On Attack ability damage dealt to the chosen unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['yoda#a-disturbing-puzzle', 'benthic-two-tubes#the-war-has-just-begun']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.passAction();

                // A different unit attacks the base and its On Attack ping targets the chosen unit
                context.player1.clickCard(context.benthicTwoTubes);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.p2Base.damage).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });
        });

        // Yoda's prevention is a lasting effect, not an ability the chosen unit gains, so losing all abilities doesn't remove it
        describe('Yoda\'s prevention when the chosen unit loses all abilities', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['yoda#a-disturbing-puzzle']
                    }
                });
            });

            function useKazudaOnBattlefieldMarine(context) {
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Remove all abilities from a friendly unit, then take another action');
                context.player1.clickCard(context.battlefieldMarine);
            }

            it('should still prevent combat damage if the unit loses all abilities after Yoda chooses it', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.yoda);
                context.player2.clickCard(context.p1Base);
                context.player2.clickCard(context.battlefieldMarine);

                useKazudaOnBattlefieldMarine(context);

                // The extra action from Kazuda: the chosen unit attacks Yoda
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.yoda);
                resolveBothPreventions(context.player1);

                expect(context.yoda.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should still prevent combat damage if Yoda chooses a unit that has already lost all abilities', function () {
                const { context } = contextRef;

                useKazudaOnBattlefieldMarine(context);
                context.player1.passAction();

                context.player2.clickCard(context.yoda);
                context.player2.clickCard(context.p1Base);
                context.player2.clickCard(context.battlefieldMarine);

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.yoda);
                resolveBothPreventions(context.player1);

                expect(context.yoda.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
