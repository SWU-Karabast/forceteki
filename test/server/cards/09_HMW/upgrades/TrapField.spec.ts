describe('Trap Field', function() {
    integration(function(contextRef) {
        it('Trap Field\'s ability should trigger when a enemy non-leader ground unit enters play and allow defeating the upgrade to deal 3 damage', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['trap-field'],
                },
                player2: {
                    hand: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.trapField);
            context.player1.clickCard(context.p1Base);

            context.player2.clickCard(context.wampa);
            expect(context.player1).toHavePassAbilityPrompt('Defeat this upgrade to deal 3 damage to Wampa');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeActivePlayer();
            expect(context.trapField).toBeInZone('discard');
            expect(context.wampa.damage).toBe(3);
        });

        it('Trap Field\'s ability should trigger when a token ground unit enters play and allow defeating the upgrade to deal 3 damage', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['trap-field'],
                },
                player2: {
                    groundArena: ['dedra-meero#with-verifiable-data']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.trapField);
            context.player1.clickCard(context.p1Base);

            context.player2.clickCard(context.dedraMeero);
            context.player2.clickCard(context.p1Base);
            expect(context.player1).toHavePassAbilityPrompt('Defeat this upgrade to deal 3 damage to Spy');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeActivePlayer();
            expect(context.trapField).toBeInZone('discard');
            expect(() => context.player1.findCardByName('spy')).toThrowError('Could not find any cards matching name spy');
        });

        it('Trap Field\'s ability should trigger when a friendly non-leader ground unit enters play and allow defeating the upgrade to deal 3 damage', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['trap-field', 'battlefield-marine'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.trapField);
            context.player1.clickCard(context.p1Base);

            context.player2.passAction();
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toHavePassAbilityPrompt('Defeat this upgrade to deal 3 damage to Battlefield Marine');
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            expect(context.trapField).toBeAttachedTo(context.p1Base);
            expect(context.battlefieldMarine.damage).toBe(0);
        });

        it('Trap Field\'s ability should not trigger when a space unit enters play', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['trap-field'],
                },
                player2: {
                    hand: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.trapField);
            context.player1.clickCard(context.p1Base);

            context.player2.clickCard(context.awing);

            expect(context.player1).toBeActivePlayer();
            expect(context.trapField).toBeAttachedTo(context.p1Base);
            expect(context.awing.damage).toBe(0);
        });

        it('Trap Field\'s ability should not trigger when a leader ground unit enters play', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['trap-field'],
                },
                player2: {
                    leader: 'fennec-shand#honoring-the-deal'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.trapField);
            context.player1.clickCard(context.p1Base);

            context.player2.clickCard(context.fennecShand);
            context.player2.clickPrompt('Deploy Fennec Shand');

            expect(context.player1).toBeActivePlayer();
            expect(context.fennecShand).toBeInZone('groundArena');
            expect(context.trapField).toBeAttachedTo(context.p1Base);
            expect(context.fennecShand.damage).toBe(0);
        });
    });
});
