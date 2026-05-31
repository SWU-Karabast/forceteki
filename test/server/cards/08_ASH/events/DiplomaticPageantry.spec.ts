describe('Diplomatic Pageantry', function() {
    integration(function(contextRef) {
        describe('Diplomatic Pageantry\'s ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['diplomatic-pageantry'],
                        groundArena: ['battlefield-marine', 'wampa'],
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['green-squadron-awing'],
                        leader: { card: 'boba-fett#collecting-the-bounty', deployed: true }
                    }
                });
            });

            it('should exhaust a friendly unit and an enemy unit, then give 2 Advantage tokens to the friendly unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.diplomaticPageantry);
                expect(context.player1).toHavePrompt('Choose a friendly unit to exhaust');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toHavePrompt('Choose an enemy unit to exhaust');
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.greenSquadronAwing, context.bobaFett]);

                context.player1.clickCard(context.atst);

                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.atst.exhausted).toBeTrue();
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['advantage', 'advantage']);
                expect(context.player2).toBeActivePlayer();
                expect(context.getChatLogs(2)).toEqual([
                    'player1 plays Diplomatic Pageantry to exhaust Battlefield Marine and to exhaust AT-ST',
                    'player1 uses Diplomatic Pageantry to give 2 Advantage tokens to Battlefield Marine',
                ]);
            });

            it('should be able to target a leader unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.diplomaticPageantry);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.greenSquadronAwing, context.bobaFett]);
                context.player1.clickCard(context.bobaFett);

                expect(context.wampa.exhausted).toBeTrue();
                expect(context.bobaFett.exhausted).toBeTrue();
                expect(context.wampa).toHaveExactUpgradeNames(['advantage', 'advantage']);
                expect(context.player2).toBeActivePlayer();
                expect(context.getChatLogs(2)).toEqual([
                    'player1 plays Diplomatic Pageantry to exhaust Wampa and to exhaust Boba Fett',
                    'player1 uses Diplomatic Pageantry to give 2 Advantage tokens to Wampa',
                ]);
            });
        });

        it('should not give Advantage tokens if there is no valid enemy unit to exhaust', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['diplomatic-pageantry'],
                    groundArena: ['battlefield-marine'],
                },
                player2: {
                    groundArena: [{ card: 'atst', exhausted: true }],
                    leader: { card: 'boba-fett#collecting-the-bounty', deployed: true, exhausted: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.diplomaticPageantry);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine.exhausted).toBeTrue();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.player2).toBeActivePlayer();
            expect(context.getChatLogs()).toEqual([
                'player1 plays Diplomatic Pageantry to exhaust Battlefield Marine',
            ]);
        });

        it('should allow exhausting an enemy unit even if there are no valid friendly units', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['diplomatic-pageantry'],
                    groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                },
                player2: {
                    groundArena: [{ card: 'atst', exhausted: false }],
                    leader: { card: 'boba-fett#collecting-the-bounty', deployed: true, exhausted: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.diplomaticPageantry);
            context.player1.clickCard(context.atst);

            expect(context.atst.exhausted).toBeTrue();
            expect(context.player2).toBeActivePlayer();
            expect(context.getChatLogs()).toEqual([
                'player1 plays Diplomatic Pageantry to exhaust AT-ST',
            ]);
        });
    });
});
