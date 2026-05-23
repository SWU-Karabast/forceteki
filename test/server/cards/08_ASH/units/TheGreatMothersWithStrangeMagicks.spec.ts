describe('The Great Mothers, With Strange Magicks', function() {
    integration(function(contextRef) {
        it('should defeat a non-leader unit it dealt combat damage to when the attack ends', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['the-great-mothers#with-strange-magicks']
                },
                player2: {
                    groundArena: ['alderaanian-envoys']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theGreatMothers);
            context.player1.clickCard(context.alderaanianEnvoys);

            expect(context.theGreatMothers.damage).toBe(3);
            expect(context.alderaanianEnvoys).toBeInZone('discard', context.player2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should not defeat a non-leader unit with a shield because no combat damage was dealt to it', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['the-great-mothers#with-strange-magicks']
                },
                player2: {
                    groundArena: [{ card: 'wampa', upgrades: ['shield'] }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theGreatMothers);
            context.player1.clickCard(context.wampa);

            expect(context.theGreatMothers.damage).toBe(4);
            expect(context.wampa.damage).toBe(0);
            expect(context.shield).not.toBeAttachedTo(context.wampa);
            expect(context.wampa).toBeInZone('groundArena', context.player2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should not defeat anything if it dealt combat damage to a base', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['the-great-mothers#with-strange-magicks']
                },
                player2: {
                    groundArena: ['alderaanian-envoys']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theGreatMothers);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(6);
            expect(context.alderaanianEnvoys).toBeInZone('groundArena', context.player2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should not defeat a leader unit it dealt combat damage to', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['the-great-mothers#with-strange-magicks']
                },
                player2: {
                    leader: { card: 'satine-kryze#standing-on-principles', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theGreatMothers);
            context.player1.clickCard(context.satineKryze);

            expect(context.satineKryze.damage).toBe(6);
            expect(context.satineKryze).toBeInZone('groundArena', context.player2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should grant its When Attack Ends ability through Support for the supported attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-great-mothers#with-strange-magicks'],
                    groundArena: ['scavenging-sandcrawler'],
                    resources: 10
                },
                player2: {
                    groundArena: ['maul#master-of-the-shadow-collective']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theGreatMothers);
            context.player1.clickCard(context.scavengingSandcrawler);
            context.player1.clickCard(context.maul);

            expect(context.scavengingSandcrawler.damage).toBe(6);
            expect(context.maul).toBeInZone('discard', context.player2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should grant its When Attack Ends ability through Support and defeat each non-leader unit Darth Maul dealt combat damage to', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-great-mothers#with-strange-magicks'],
                    groundArena: ['darth-maul#revenge-at-last'],
                    resources: 10
                },
                player2: {
                    groundArena: ['atst', 'consular-security-force']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theGreatMothers);
            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.consularSecurityForce);
            context.player1.clickDone();

            expect(context.darthMaul).toBeInZone('discard', context.player1);
            expect(context.atst).toBeInZone('discard', context.player2);
            expect(context.consularSecurityForce).toBeInZone('discard', context.player2);
            expect(context.player2).toBeActivePlayer();
            expect(context.getChatLogs(1)).toContain('player1 uses Darth Maul\'s gained ability from The Great Mothers to defeat AT-ST and Consular Security Force');
        });

        it('should use the defending unit title in simultaneous trigger prompts', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-great-mothers#with-strange-magicks'],
                    spaceArena: ['hounds-tooth#hunters-approach'],
                    resources: 10
                },
                player2: {
                    spaceArena: ['lambda-shuttle']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theGreatMothers);
            context.player1.clickCard(context.houndsTooth);
            context.player1.clickCard(context.lambdaShuttle);

            expect(context.player1).toHaveExactPromptButtons([
                'Defeat Lambda Shuttle',
                'If this unit survived, you may defeat a unit with less power than this unit'
            ]);
            context.player1.clickPrompt('Defeat Lambda Shuttle');

            expect(context.lambdaShuttle).toBeInZone('discard', context.player2);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
