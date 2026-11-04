describe('Yoda, A Disturbing Puzzle', function() {
    integration(function(contextRef) {
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

            const preventionTitle = 'Prevent all combat damage that would be dealt to and dealt by this unit';

            // The damage dealt to and the damage dealt by the chosen unit are two simultaneous replacements of the
            // same gained ability, so its controller is asked to resolve the grouped triggers
            function resolveBothPreventions(player) {
                expect(player).toHavePrompt(`Resolve "${preventionTitle}"`);
                expect(player).toHaveExactPromptButtons(['Resolve next', 'Resolve all (2)']);
                player.clickPrompt('Resolve all (2)');
            }

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
    });
});
