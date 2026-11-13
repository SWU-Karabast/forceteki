describe('Rey, Embracing Destiny', function() {
    integration(function(contextRef) {
        const abilityTitle = 'Attack with a unit. It gets +2/+0 for this attack';
        const discardPrompt = 'Choose a card to discard';

        it('should pay 1 resource and discard a card to attack with herself, giving her +2/+0 for that attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['vanquish', 'wampa'],
                    groundArena: [
                        'rey#embracing-destiny',
                        'battlefield-marine',
                        { card: 'pyke-sentinel', exhausted: true }
                    ],
                    resources: 3
                },
                player2: {
                    groundArena: ['consular-security-force']
                }
            });

            const { context } = contextRef;

            // Activate Rey's ability and choose Rey as the attacker
            context.player1.clickCard(context.reyEmbracingDestiny);
            expect(context.player1).toHaveExactPromptButtons(['Attack', abilityTitle, 'Cancel']);
            context.player1.clickPrompt(abilityTitle);
            expect(context.player1).toBeAbleToSelectExactly([context.reyEmbracingDestiny, context.battlefieldMarine]);
            context.player1.clickCard(context.reyEmbracingDestiny);

            // Pay the discard cost
            expect(context.player1).toHavePrompt(discardPrompt);
            expect(context.player1).toBeAbleToSelectExactly([context.vanquish, context.wampa]);
            context.player1.clickCard(context.vanquish);
            expect(context.vanquish).toBeInZone('discard', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(1);

            // Rey attacks the opposing base
            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.consularSecurityForce]);
            context.player1.clickCard(context.p2Base);

            // Rey dealt 8 damage with the bonus, and her power returns to normal after the attack
            expect(context.p2Base.damage).toBe(8);
            expect(context.reyEmbracingDestiny.exhausted).toBeTrue();
            expect(context.reyEmbracingDestiny.getPower()).toBe(6);
            expect(context.player2).toBeActivePlayer();
        });

        it('should attack with another friendly unit, giving it +2/+0 for that attack only', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa'],
                    groundArena: ['rey#embracing-destiny', 'consular-security-force'],
                    resources: 1
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            // Use Rey's ability to attack AT-ST with Consular Security Force, discarding Wampa
            context.player1.clickCard(context.reyEmbracingDestiny);
            context.player1.clickPrompt(abilityTitle);
            context.player1.clickCard(context.consularSecurityForce);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.atst);

            // Consular Security Force attacked with the bonus, Rey stays ready
            expect(context.atst.damage).toBe(5);
            expect(context.consularSecurityForce.damage).toBe(6);
            expect(context.consularSecurityForce.exhausted).toBeTrue();
            expect(context.consularSecurityForce.getPower()).toBe(3);
            expect(context.reyEmbracingDestiny.exhausted).toBeFalse();

            // Costs were paid
            expect(context.player1.exhaustedResourceCount).toBe(1);
            expect(context.wampa).toBeInZone('discard', context.player1);
            expect(context.player2).toBeActivePlayer();
        });

        it('should be usable while Rey is exhausted, and again in a later action of the same phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['vanquish', 'academy-training'],
                    groundArena: [
                        { card: 'rey#embracing-destiny', exhausted: true },
                        'battlefield-marine',
                        'wampa'
                    ],
                    resources: 2
                }
            });

            const { context } = contextRef;

            // First use: attack the base with Battlefield Marine, discarding Academy Training
            context.player1.clickCard(context.reyEmbracingDestiny);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toHavePrompt(discardPrompt);
            context.player1.clickCard(context.academyTraining);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(5);
            expect(context.academyTraining).toBeInZone('discard', context.player1);

            // P2 passes
            context.player2.passAction();

            // Second use: attack the base with Wampa, discarding Vanquish
            context.player1.clickCard(context.reyEmbracingDestiny);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.vanquish);
            context.player1.clickCard(context.p2Base);

            // Both bonuses expired and both costs were paid
            expect(context.p2Base.damage).toBe(11);
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.wampa.getPower()).toBe(4);
            expect(context.vanquish).toBeInZone('discard', context.player1);
            expect(context.player1.handSize).toBe(0);
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should count the cost as a discard from hand for the discarded card\'s abilities', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['kylos-tie-silencer#follow-my-lead'],
                    groundArena: ['rey#embracing-destiny'],
                    resources: 10
                }
            });

            const { context } = contextRef;

            // Attack with Rey, discarding Kylo's TIE Silencer
            context.player1.clickCard(context.reyEmbracingDestiny);
            context.player1.clickPrompt(abilityTitle);
            context.player1.clickCard(context.reyEmbracingDestiny);
            context.player1.clickCard(context.kylosTieSilencer);
            context.player1.clickCard(context.p2Base);

            expect(context.kylosTieSilencer).toBeInZone('discard', context.player1);
            expect(context.p2Base.damage).toBe(8);

            // P2 passes
            context.player2.passAction();

            // Kylo's TIE Silencer can be played from the discard pile
            expect(context.player1).toBeAbleToSelect(context.kylosTieSilencer);
            context.player1.clickCard(context.kylosTieSilencer);
            expect(context.kylosTieSilencer).toBeInZone('spaceArena', context.player1);
        });

        it('should not be usable with an empty hand', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [
                        { card: 'rey#embracing-destiny', exhausted: true },
                        'battlefield-marine'
                    ],
                    resources: 3
                }
            });

            const { context } = contextRef;

            expect(context.reyEmbracingDestiny).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });

        it('should not be usable with no ready resources', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa'],
                    groundArena: [
                        { card: 'rey#embracing-destiny', exhausted: true },
                        'battlefield-marine'
                    ],
                    resources: { readyCount: 0, exhaustedCount: 3 }
                }
            });

            const { context } = contextRef;

            expect(context.reyEmbracingDestiny).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });

        it('should still pay its costs when no friendly unit can attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa'],
                    groundArena: [
                        { card: 'rey#embracing-destiny', exhausted: true },
                        { card: 'battlefield-marine', exhausted: true }
                    ],
                    resources: 3
                }
            });

            const { context } = contextRef;

            // Use the ability anyway despite having no legal attacker
            context.player1.clickCard(context.reyEmbracingDestiny);
            expect(context.player1).toHaveNoEffectAbilityPrompt(abilityTitle);
            context.player1.clickPrompt('Use it anyway');

            // Discard Wampa to pay the cost
            context.player1.clickCard(context.wampa);

            // Costs were paid but no attack happened
            expect(context.wampa).toBeInZone('discard', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(1);
            expect(context.p2Base.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
