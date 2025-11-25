describe('Jedha Agitator', function() {
    integration(function(contextRef) {
        describe('Jedha Agitator\'s on attack ability', function() {
            it('should do nothing if no leader is deployed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['jedha-agitator'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.jedhaAgitator);
                context.player1.clickCard(context.p2Base);
                expect(context.jedhaAgitator.exhausted).toBe(true);

                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 2 damage to a ground unit or base if a leader is deployed', async function () {
                await contextRef.setupTestAsync({
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
                const { context } = contextRef;

                // ************** CASE 1: deal damage to a ground unit **************
                context.player1.clickCard(context.jedhaAgitator);
                context.player1.clickCard(context.p2Base);
                expect(context.jedhaAgitator.exhausted).toBe(true);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.jedhaAgitator, context.battlefieldMarine, context.p1Base, context.p2Base, context.hunter]);

                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(2);
                expect(context.p2Base.damage).toBe(2);

                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();
                context.readyCard(context.jedhaAgitator);

                // ************** CASE 2: deal damage to base **************
                context.player1.clickCard(context.jedhaAgitator);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.p1Base);
                expect(context.jedhaAgitator.exhausted).toBe(true);
                expect(context.p1Base.damage).toBe(2);
                expect(context.p2Base.damage).toBe(4);

                context.player2.passAction();
                context.readyCard(context.jedhaAgitator);

                // ************** CASE 3: deal damage to self **************
                context.player1.clickCard(context.jedhaAgitator);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.jedhaAgitator);
                expect(context.jedhaAgitator).toBeInZone('discard');
                expect(context.p1Base.damage).toBe(2);
                expect(context.p2Base.damage).toBe(4);     // attack did not resolve
            });

            it('works when you control a pilot leader upgrade that makes attached unit a leader', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        spaceArena: ['n1-starfighter'],
                        groundArena: ['jedha-agitator']
                    }
                });

                const { context } = contextRef;

                // Deploy Kazuda Xiono as a pilot on N-1 Starfighter
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Deploy Kazuda Xiono as a Pilot');
                context.player1.clickCard(context.n1Starfighter);
                context.player2.passAction();

                // Now attack with Jedha Agitator
                context.player1.clickCard(context.jedhaAgitator);
                context.player1.clickCard(context.p2Base);

                // Ability triggers & deals 2 damage
                expect(context.player1).toHavePrompt('Deal 2 damage to a ground unit or base');
                expect(context.player1).toBeAbleToSelectExactly([context.jedhaAgitator, context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);
            });

            it('does not work when you control a pilot leader upgrade that does not make attached unit a leader', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'poe-dameron#i-can-fly-anything',
                        spaceArena: ['green-squadron-awing'],
                        groundArena: ['jedha-agitator']
                    }
                });

                const { context } = contextRef;

                // Attach Poe as a pilot on Green Squadron A-Wing
                context.player1.clickCard(context.poeDameron);
                context.player1.clickPrompt('Flip Poe Dameron and attach him as an upgrade to a friendly Vehicle unit without a Pilot on it');
                context.player1.clickCard(context.greenSquadronAwing);
                context.player2.passAction();

                // Now attack with Jedha Agitator
                context.player1.clickCard(context.jedhaAgitator);
                context.player1.clickCard(context.p2Base);

                // No ability to resolve, it is now P2's turn
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(2); // only attack damage applied
            });

            it('should not prevent the Saboteur shield defeat if used to defeat itself', async function () {
                await contextRef.setupTestAsync({
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
