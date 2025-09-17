describe('Syril Karn, Where Is He?', function () {
    integration(function (contextRef) {
        it('on attack: after disclosing Aggression, Aggression, Villainy, choose an enemy unit and its controller may discard 1 to prevent 2 damage', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['syril-karn#where-is-he', 'vanguard-infantry'],
                    hand: [
                        'karabast',              // Aggression | Heroism
                        'wampa',                 // Aggression
                        'superlaser-technician'  // Command | Villainy
                    ]
                },
                player2: {
                    hand: ['resupply'], // single card to discard
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            // Attack with Syril to trigger disclose
            context.player1.clickCard(context.syrilKarnWhereIsHe);
            context.player1.clickCard(context.p2Base);

            // Disclose [Aggression, Aggression, Villainy]
            // Keep prompt assertions resilient; check selectable cards instead of exact text
            expect(context.player1).toBeAbleToSelectExactly([context.karabast, context.wampa, context.superlaserTechnician]);
            context.player1.clickCard(context.karabast);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.superlaserTechnician);
            context.player1.clickDone();

            // Opponent reviews disclosed cards
            expect(context.player2).toHaveExactViewableDisplayPromptCards([context.karabast, context.wampa, context.superlaserTechnician]);
            context.player2.clickDone();

            // Choose target unit (can be any unit). Choose enemy AT-ST.
            expect(context.player1).toBeAbleToSelectExactly([context.syrilKarn, context.vanguardInfantry, context.atst]);
            context.player1.clickCard(context.atst);

            // Now the opponent (controller of AT-ST) gets to choose: damage or discard
            expect(context.player2).toHaveExactPromptButtons([`${context.atst.title} takes 2 damage`, 'Discard a card']);
            context.player2.clickPrompt('Discard a card');

            expect(context.player2).toBeAbleToSelectExactly([context.resupply]);
            context.player2.clickCard(context.resupply);

            // Verify no damage applied to AT-ST, and opponent discarded 1 card
            expect(context.atst.damage).toBe(0);
            expect(context.resupply).toBeInZone('discard', context.player2);
        });

        it('on attack: after disclosing, choosing a friendly unit lets you decide to take 2 damage instead of discarding', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['syril-karn#where-is-he', 'atst'],
                    hand: [
                        'karabast',              // Aggression | Heroism
                        'wampa',                 // Aggression
                        'superlaser-technician'  // Command | Villainy
                    ]
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            // Attack with Syril to trigger disclose
            context.player1.clickCard(context.syrilKarnWhereIsHe);
            context.player1.clickCard(context.p2Base);

            // Disclose required aspects
            expect(context.player1).toBeAbleToSelectExactly([context.karabast, context.wampa, context.superlaserTechnician]);
            context.player1.clickCard(context.karabast);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.superlaserTechnician);
            context.player1.clickDone();
            context.player2.clickDone();

            // Choose a friendly unit (Vanguard Infantry) as target
            expect(context.player1).toBeAbleToSelectExactly([context.syrilKarn, context.atst, context.battlefieldMarine]);
            context.player1.clickCard(context.atst);

            // Now the choosing player is Player 1 (controller of Vanguard Infantry)
            expect(context.player1).toHaveExactPromptButtons([`${context.atst.title} takes 2 damage`, 'Discard a card']);
            context.player1.clickPrompt(`${context.atst.title} takes 2 damage`);

            // Verify damage applied and no discard for player1
            expect(context.atst.damage).toBe(2);
            // Ensure the disclosed cards remain in hand (they were revealed, not discarded)
            expect(context.karabast).toBeInZone('hand', context.player1);
            expect(context.wampa).toBeInZone('hand', context.player1);
            expect(context.superlaserTechnician).toBeInZone('hand', context.player1);
        });

        it('allows passing on disclose; no unit is chosen and no damage/discard occurs', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['syril-karn#where-is-he', 'vanguard-infantry'],
                    hand: ['karabast', 'wampa', 'superlaser-technician']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.syrilKarnWhereIsHe);
            context.player1.clickCard(context.p2Base);

            // Disclose shows; choose to pass
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickPrompt('Choose nothing');

            // It should now be opponent's action, and no damage/discard happened
            expect(context.player2).toBeActivePlayer();
            expect(context.vanguardInfantry.damage).toBe(0);
            expect(context.player1.discard.length).toBe(0);
        });
    });
});
