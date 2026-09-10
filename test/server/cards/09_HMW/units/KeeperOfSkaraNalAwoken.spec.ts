describe('Keeper of Skara Nal, Awoken', function() {
    integration(function(contextRef) {
        it('should discard 2 cards named Keeper of Skara Nal to get +15/+0 and Overwhelm for the attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['keeper-of-skara-nal#awoken', 'keeper-of-skara-nal#awoken', 'atst'],
                    groundArena: ['keeper-of-skara-nal#awoken'],
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;
            const handKeepers = context.player1.findCardsByName('keeper-of-skara-nal#awoken', 'hand');
            const groundKeeper = context.player1.findCardByName('keeper-of-skara-nal#awoken', 'groundArena');

            context.player1.clickCard(groundKeeper);
            context.player1.clickCard(context.wampa);

            context.player1.clickPrompt('Discard 2 cards named Keeper of Skara Nal from your hand. If you do, this unit gets +15/+0 and gains Overwhelm for this attack.');

            expect(context.player1).toBeAbleToSelectExactly([handKeepers[0], handKeepers[1]]);
            expect(context.player1).toHaveChooseNothingButton();
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(handKeepers[0]);
            expect(context.player1).not.toHaveEnabledPromptButton('Done');
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(handKeepers[1]);
            context.player1.clickDone();

            expect(context.player2).toBeActivePlayer();

            // Keeper gets +15/+0 (5 -> 20) and Overwhelm, defeating Wampa and dealing 15 excess to base
            expect(context.wampa).toBeInZone('discard');
            expect(context.p2Base.damage).toBe(15);

            expect(handKeepers[0]).toBeInZone('discard', context.player1);
            expect(handKeepers[1]).toBeInZone('discard', context.player1);
        });

        it('should not discard Keeper of Skara Nal cards if selecting one and pass (and should not have +15 and Overwhelm)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['keeper-of-skara-nal#awoken', 'keeper-of-skara-nal#awoken', 'atst'],
                    groundArena: ['keeper-of-skara-nal#awoken'],
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;
            const handKeepers = context.player1.findCardsByName('keeper-of-skara-nal#awoken', 'hand');
            const groundKeeper = context.player1.findCardByName('keeper-of-skara-nal#awoken', 'groundArena');

            context.player1.clickCard(groundKeeper);
            context.player1.clickCard(context.wampa);

            context.player1.clickPrompt('Discard 2 cards named Keeper of Skara Nal from your hand. If you do, this unit gets +15/+0 and gains Overwhelm for this attack.');
            expect(context.player1).toBeAbleToSelectExactly([handKeepers[0], handKeepers[1]]);
            context.player1.clickCard(handKeepers[0]);
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();

            // Keeper gets +15/+0 (5 -> 20) and Overwhelm, defeating Wampa and dealing 15 excess to base
            expect(context.wampa).toBeInZone('discard');
            expect(context.p2Base.damage).toBe(0);

            expect(handKeepers[0]).toBeInZone('hand', context.player1);
            expect(handKeepers[1]).toBeInZone('hand', context.player1);
        });

        it('should not trigger if player cannot discard 2 copy of Keeper of Skara Nal', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['keeper-of-skara-nal#awoken', 'porg'],
                    groundArena: ['keeper-of-skara-nal#awoken'],
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            const groundKeeper = context.player1.findCardByName('keeper-of-skara-nal#awoken', 'groundArena');

            context.player1.clickCard(groundKeeper);
            context.player1.clickCard(context.atst);

            // no trigger as we do not card 2 copy of keeper of skara nal

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(0);
            expect(context.atst.damage).toBe(5);
        });
    });
});
