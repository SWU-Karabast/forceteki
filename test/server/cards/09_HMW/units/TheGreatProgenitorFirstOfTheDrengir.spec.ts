describe('The Great Progenitor, First of the Drengir', function() {
    integration(function(contextRef) {
        it('should give itself a Weakness token and create a Beast token when its attack ends', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['the-great-progenitor#first-of-the-drengir']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theGreatProgenitor);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt('Give a Weakness token to this unit. If you do, create 1 Beast token');
            context.player1.clickPrompt('Trigger');

            // The Great Progenitor gets a Weakness token (4/7 -> 3/6) and creates 1 Beast token
            expect(context.theGreatProgenitor).toHaveExactUpgradeNames(['weakness']);
            expect(context.theGreatProgenitor.getPower()).toBe(3);
            expect(context.theGreatProgenitor.getHp()).toBe(6);

            const beasts = context.player1.findCardsByName('beast');
            expect(beasts.length).toBe(1);
            expect(beasts[0]).toBeInZone('groundArena', context.player1);
            expect(context.player2).toBeActivePlayer();
        });

        it('should create a Beast token for each Weakness token on it, including pre-existing ones', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'the-great-progenitor#first-of-the-drengir', upgrades: ['weakness', 'weakness'] }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theGreatProgenitor);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt('Give a Weakness token to this unit. If you do, create 3 Beast tokens');
            context.player1.clickPrompt('Trigger');

            // 2 pre-existing Weakness tokens + the new one = 3 Beast tokens
            expect(context.theGreatProgenitor).toHaveExactUpgradeNames(['weakness', 'weakness', 'weakness']);
            expect(context.theGreatProgenitor.getPower()).toBe(1);
            expect(context.theGreatProgenitor.getHp()).toBe(4);

            const beasts = context.player1.findCardsByName('beast');
            expect(beasts.length).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });

        it('should still create Beast tokens if the Weakness token defeats it', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'the-great-progenitor#first-of-the-drengir', upgrades: ['weakness', 'weakness', 'weakness', 'weakness', 'weakness', 'weakness'] }]
                }
            });

            const { context } = contextRef;

            // 6 Weakness tokens -> 1 HP remaining
            expect(context.theGreatProgenitor.getHp()).toBe(1);

            context.player1.clickCard(context.theGreatProgenitor);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt('Give a Weakness token to this unit. If you do, create 7 Beast tokens');
            context.player1.clickPrompt('Trigger');

            // The 7th Weakness token defeats it, but a Beast token is still created for each Weakness it had
            expect(context.theGreatProgenitor).toBeInZone('discard', context.player1);

            const beasts = context.player1.findCardsByName('beast');
            expect(beasts.length).toBe(7);
            expect(context.player2).toBeActivePlayer();
        });

        it('should do nothing when the ability is declined', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['the-great-progenitor#first-of-the-drengir']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theGreatProgenitor);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt('Give a Weakness token to this unit. If you do, create 1 Beast token');
            context.player1.clickPrompt('Pass');

            expect(context.theGreatProgenitor).toHaveExactUpgradeNames([]);
            expect(() => context.player1.findCardByName('beast')).toThrowError('Could not find any cards matching name beast');
            expect(context.player2).toBeActivePlayer();
        });

        it('should not trigger if it is defeated during the attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['the-great-progenitor#first-of-the-drengir']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // The Great Progenitor (4/7) takes 4 damage from Wampa on top of 3 existing damage and is defeated
            context.setDamage(context.theGreatProgenitor, 3);

            context.player1.clickCard(context.theGreatProgenitor);
            context.player1.clickCard(context.wampa);

            expect(context.theGreatProgenitor).toBeInZone('discard', context.player1);
            expect(() => context.player1.findCardByName('beast')).toThrowError('Could not find any cards matching name beast');
            expect(context.player2).toBeActivePlayer();
        });
    });
});
