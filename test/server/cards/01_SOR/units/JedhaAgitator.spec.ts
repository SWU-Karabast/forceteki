describe('Jedha Agitator', function() {
    integration(function(contextRef) {
        describe('Jedha Agitator\'s on attack ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['jedha-agitator'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should do nothing if no leader is deployed', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.jedhaAgitator);
                context.player1.clickCard(context.p2Base);
                expect(context.jedhaAgitator.exhausted).toBe(true);

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Jedha Agitator\'s on attack ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['jedha-agitator', 'battlefield-marine'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'hunter#outcast-sergeant', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should deal 2 damage to a ground unit or base if a leader is deployed', function () {
                const { context } = contextRef;

                // ************** CASE 1: deal damage to a ground unit **************
                context.player1.clickCard(context.jedhaAgitator);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveEnabledPromptButton('If you control a leader unit, deal 2 damage to a ground unit or base');
                expect(context.player1).toHaveEnabledPromptButton('Saboteur: defeat all shields');
                expect(context.jedhaAgitator.exhausted).toBe(true);

                context.player1.clickPrompt('If you control a leader unit, deal 2 damage to a ground unit or base');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.jedhaAgitator, context.battlefieldMarine, context.p1Base, context.p2Base, context.hunter]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(2);
                expect(context.p2Base.damage).toBe(2);

                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();
                context.jedhaAgitator.exhausted = false;

                // ************** CASE 2: deal damage to base **************
                context.player1.clickCard(context.jedhaAgitator);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('If you control a leader unit, deal 2 damage to a ground unit or base');
                context.player1.clickCard(context.p1Base);
                expect(context.jedhaAgitator.exhausted).toBe(true);
                expect(context.p1Base.damage).toBe(2);
                expect(context.p2Base.damage).toBe(4);

                context.player2.passAction();
                context.jedhaAgitator.exhausted = false;

                // ************** CASE 3: deal damage to self **************
                context.player1.clickCard(context.jedhaAgitator);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('If you control a leader unit, deal 2 damage to a ground unit or base');
                context.player1.clickCard(context.jedhaAgitator);
                expect(context.jedhaAgitator).toBeInZone('discard');
                expect(context.p1Base.damage).toBe(2);
                expect(context.p2Base.damage).toBe(4);     // attack did not resolve
            });
        });

        describe('Jedha Agitator\'s on attack ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['jedha-agitator', 'battlefield-marine'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'hunter#outcast-sergeant', deployed: true }
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['shield'] }],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should not prevent the Saboteur shield defeat if used to defeat itself', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.jedhaAgitator);
                context.player1.clickCard(context.wampa);
                context.player1.clickPrompt('If you control a leader unit, deal 2 damage to a ground unit or base');
                context.player1.clickCard(context.jedhaAgitator);

                expect(context.jedhaAgitator).toBeInZone('discard');
                expect(context.wampa.isUpgraded()).toBe(false);
                expect(context.wampa.damage).toBe(0);
            });
        });
    });
});
