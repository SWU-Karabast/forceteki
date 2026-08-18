describe('Beast Lair', function() {
    integration(function(contextRef) {
        it('Beast Lair\'s ability should trigger at the start of the action phase and allow discarding a card to create a Beast token', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['battlefield-marine', 'protector'],
                    deck: ['porg', 'atst'],
                    base: { card: 'kestro-city', upgrades: ['beast-lair'] },
                },
                player2: {
                    groundArena: ['wampa'],
                }
            });

            const { context } = contextRef;

            context.player1.claimInitiative();
            context.player2.passAction();

            context.player1.clickPrompt('Skip Resourcing');
            context.player2.clickPrompt('Skip Resourcing');

            expect(context.player1).toHavePassAbilityPrompt('Discard a card from your hand to create a Beast token');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.protector, context.porg, context.atst]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeActivePlayer();
            const beast = context.player1.findCardByName('beast');
            expect(beast).toBeInZone('groundArena', context.player1);
            expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
        });

        it('Beast Lair\'s ability can be pass', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: [ 'battlefield-marine', 'protector'],
                    deck: ['porg', 'atst'],
                    base: { card: 'kestro-city', upgrades: ['beast-lair'] },
                },
                player2: {
                    groundArena: ['wampa'],
                }
            });

            const { context } = contextRef;

            context.player1.claimInitiative();
            context.player2.passAction();

            context.player1.clickPrompt('Skip Resourcing');
            context.player2.clickPrompt('Skip Resourcing');

            expect(context.player1).toHavePassAbilityPrompt('Discard a card from your hand to create a Beast token');
            context.player1.clickPrompt('Pass');

            expect(context.player1).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('hand', context.player1);
            expect(context.atst).toBeInZone('hand', context.player1);
            expect(context.porg).toBeInZone('hand', context.player1);
            expect(context.protector).toBeInZone('hand', context.player1);
            expect(() => context.player1.findCardByName('beast')).toThrowError('Could not find any cards matching name beast');
        });

        it('Beast Lair\'s ability do not trigger if hand is empty', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    deck: [],
                    base: { card: 'kestro-city', upgrades: ['beast-lair'] },
                },
            });

            const { context } = contextRef;

            context.player1.claimInitiative();
            context.player2.passAction();

            context.player1.clickPrompt('Skip Resourcing');
            context.player2.clickPrompt('Skip Resourcing');

            expect(context.player1).toBeActivePlayer();
            expect(() => context.player1.findCardByName('beast')).toThrowError('Could not find any cards matching name beast');
        });
    });
});
