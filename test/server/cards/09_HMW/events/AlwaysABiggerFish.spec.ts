describe('Always a Bigger Fish', function () {
    integration(function (contextRef) {
        it('should defeat a friendly Creature unit and play a Creature unit costing up to 3 more from hand for free', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'great-grass-plains',
                    hand: ['always-a-bigger-fish', 'wild-rancor', 'sando-aqua-monster', 'wampa', 'battlefield-marine'],
                    groundArena: ['blurrg', 'atst']
                },
                player2: {
                    groundArena: ['nameless-terror']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.alwaysABiggerFish);
            expect(context.player1).toHavePrompt('Defeat a friendly Creature unit');

            // Only friendly Creature units: not AT-ST (non-Creature), not enemy Nameless Terror
            expect(context.player1).toBeAbleToSelectExactly([context.blurrg]);
            context.player1.clickCard(context.blurrg);

            expect(context.blurrg).toBeInZone('discard', context.player1);

            // Blurrg costs 3: can play a Creature costing up to 6. Sando Aqua Monster (8) and Battlefield Marine (non-Creature) are not selectable
            expect(context.player1).toHavePrompt('Play a Creature unit that costs up to 6 resources from your hand for free');
            expect(context.player1).toBeAbleToSelectExactly([context.wildRancor, context.wampa]);
            context.player1.clickCard(context.wampa);

            expect(context.wampa).toBeInZone('groundArena', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(2); // only the event's cost was paid
            expect(context.player2).toBeActivePlayer();
        });

        it('should limit the playable Creature cost based on the defeated unit\'s cost', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'great-grass-plains',
                    hand: ['always-a-bigger-fish', 'wampa', 'lurking-wampa'],
                    groundArena: ['womp-rat', 'atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.alwaysABiggerFish);
            context.player1.clickCard(context.wompRat);

            // Womp Rat costs 1: can play a Creature costing up to 4. Lurking Wampa (5) is not selectable
            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            context.player1.clickCard(context.wampa);

            expect(context.wampa).toBeInZone('groundArena', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should be able to play a space Creature unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'great-grass-plains',
                    hand: ['always-a-bigger-fish', 'graceful-purrgil'],
                    groundArena: ['blurrg']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.alwaysABiggerFish);
            context.player1.clickCard(context.blurrg);

            expect(context.player1).toBeAbleToSelectExactly([context.gracefulPurrgil]);
            context.player1.clickCard(context.gracefulPurrgil);

            expect(context.gracefulPurrgil).toBeInZone('spaceArena', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should trigger Purrgil Ultra\'s when defeated ability after the if you do effect', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'great-grass-plains',
                    hand: ['always-a-bigger-fish', 'wampa'],
                    groundArena: ['blurrg'],
                    spaceArena: ['purrgil-ultra']
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.alwaysABiggerFish);
            context.player1.clickCard(context.purrgilUltra);
            expect(context.purrgilUltra).toBeInZone('discard', context.player1);

            // The event's if you do resolves first: Purrgil Ultra costs 8, can play a Creature costing up to 11
            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('groundArena', context.player1);

            // Then Purrgil Ultra's when defeated ability triggers: return a friendly non-leader unit to hand
            expect(context.player1).toBeAbleToSelectExactly([context.blurrg, context.wampa]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.blurrg);

            // If you do: deal damage equal to the returned unit's cost (Blurrg costs 3) to a unit
            expect(context.player1).toHavePrompt('Deal 3 damage to a unit');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
            context.player1.clickCard(context.atst);

            expect(context.blurrg).toBeInZone('hand', context.player1);
            expect(context.atst.damage).toBe(3);
            expect(context.player1.exhaustedResourceCount).toBe(2); // only the event's cost was paid
            expect(context.player2).toBeActivePlayer();
        });

        it('should fizzle the play effect if there is no valid Creature unit in hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'great-grass-plains',
                    hand: ['always-a-bigger-fish', 'battlefield-marine', 'sando-aqua-monster'],
                    groundArena: ['womp-rat']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.alwaysABiggerFish);
            context.player1.clickCard(context.wompRat);

            // Womp Rat costs 1: Sando Aqua Monster (8) is too expensive and Battlefield Marine is not a Creature
            expect(context.wompRat).toBeInZone('discard', context.player1);
            expect(context.sandoAquaMonster).toBeInZone('hand', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should use a cost of 0 when defeating a Beast token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'great-grass-plains',
                    hand: ['always-a-bigger-fish', 'womp-rat', 'wampa'],
                    groundArena: ['beast']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.alwaysABiggerFish);
            context.player1.clickCard(context.beast);

            expect(context.beast).toBeInZone('outsideTheGame');

            // Beast token costs 0: can play a Creature costing up to 3. Wampa (4) is not selectable
            expect(context.player1).toHavePrompt('Play a Creature unit that costs up to 3 resources from your hand for free');
            expect(context.player1).toBeAbleToSelectExactly([context.wompRat]);
            context.player1.clickCard(context.wompRat);

            expect(context.wompRat).toBeInZone('groundArena', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should use the copied unit\'s cost when defeating a Clone', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'great-grass-plains',
                    leader: 'tarfful#fighting-from-the-shadowlands',
                    hand: ['always-a-bigger-fish', 'clone', 'wild-rancor', 'sando-aqua-monster'],
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Play Clone as a copy of Wampa
            context.player1.clickCard(context.clone);
            expect(context.player1).toHavePrompt('Choose a unit to clone');
            context.player1.clickCard(context.wampa);
            expect(context.clone).toBeCloneOf(context.wampa);

            context.player2.passAction();

            context.player1.clickCard(context.alwaysABiggerFish);

            // Both Wampa and the Clone (a Wampa copy) are friendly Creature units
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.clone]);
            context.player1.clickCard(context.clone);
            expect(context.clone).toBeInZone('discard', context.player1);

            // The Clone's cost is the copied Wampa's cost (4), not Clone's printed cost (7): can play a Creature costing up to 7
            expect(context.player1).toHavePrompt('Play a Creature unit that costs up to 7 resources from your hand for free');
            expect(context.player1).toBeAbleToSelectExactly([context.wildRancor]);
            context.player1.clickCard(context.wildRancor);

            expect(context.wildRancor).toBeInZone('groundArena', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(9); // 7 for Clone + 2 for the event
            expect(context.player2).toBeActivePlayer();
        });

        it('should be able to decline playing a Creature unit from hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'great-grass-plains',
                    hand: ['always-a-bigger-fish', 'wampa'],
                    groundArena: ['blurrg']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.alwaysABiggerFish);
            context.player1.clickCard(context.blurrg);

            // Choosing from a hidden zone: the player may choose nothing
            expect(context.player1).toHavePrompt('Play a Creature unit that costs up to 6 resources from your hand for free');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickPrompt('Choose nothing');

            expect(context.wampa).toBeInZone('hand', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
