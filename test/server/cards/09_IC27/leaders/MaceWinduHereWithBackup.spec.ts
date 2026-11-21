describe('Mace Windu, Here With Backup', function() {
    integration(function(contextRef) {
        describe('Mace Windu\'s leader side action ability', function() {
            const actionTitle = 'Attack with a unit. It gains Restore 2 for this attack';

            it('should attack with a ready unit and give it Restore 2 for that attack', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'mace-windu#here-with-backup',
                        groundArena: ['battlefield-marine', { card: 'wampa', exhausted: true }],
                        base: { card: 'chopper-base', damage: 5 }
                    }
                });

                const { context } = contextRef;

                // Activate Mace Windu's leader ability
                context.player1.clickCard(context.maceWindu);
                expect(context.player1).toHavePrompt('Choose an action for Mace Windu');
                context.player1.clickPrompt(actionTitle);

                // Choose the only ready unit to attack with
                expect(context.player1).toHavePrompt(actionTitle);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                // Attack the enemy base
                expect(context.player1).toHavePrompt('Choose a target for attack');
                context.player1.clickCard(context.p2Base);

                // Restore 2 heals the friendly base, the keyword is only temporary
                expect(context.p1Base.damage).toBe(3);
                expect(context.p2Base.damage).toBe(3);
                expect(context.maceWindu.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.battlefieldMarine.hasSomeKeyword('restore')).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('should stack with the attacker\'s printed Restore', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'mace-windu#here-with-backup',
                        groundArena: ['asp-laborer'],
                        base: { card: 'chopper-base', damage: 5 }
                    }
                });

                const { context } = contextRef;

                // Activate Mace Windu's leader ability
                context.player1.clickCard(context.maceWindu);
                expect(context.player1).toHavePrompt('Choose an action for Mace Windu');
                context.player1.clickPrompt(actionTitle);

                // Choose the unit with printed Restore to attack with
                expect(context.player1).toHavePrompt(actionTitle);
                expect(context.player1).toBeAbleToSelectExactly([context.aspLaborer]);
                context.player1.clickCard(context.aspLaborer);

                // Attack the enemy base
                expect(context.player1).toHavePrompt('Choose a target for attack');
                context.player1.clickCard(context.p2Base);

                // Printed Restore and granted Restore heal the friendly base together
                expect(context.p1Base.damage).toBe(2);
                expect(context.maceWindu.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('can be used to no effect when there are no ready units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'mace-windu#here-with-backup',
                        base: { card: 'chopper-base', damage: 5 },
                        groundArena: [{ card: 'wampa', exhausted: true }]
                    }
                });

                const { context } = contextRef;

                // Try to activate the ability with no ready units, then cancel
                context.player1.clickCard(context.maceWindu);
                expect(context.player1).toHavePrompt('Choose an action for Mace Windu');
                context.player1.clickPrompt(`(No effect) ${actionTitle}`);
                expect(context.player1).toHavePrompt(`The ability "${actionTitle}" will have no effect. Are you sure you want to use it?`);
                context.player1.clickPrompt('Use it anyway');

                // Ability was used but nothing happened other than costs paid
                expect(context.maceWindu.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.p1Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Mace Windu\'s leader unit side When Deployed ability', function() {
            const deployPrompt = 'Deploy Mace Windu';

            it('should resource the top card of the deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'mace-windu#here-with-backup',
                        deck: ['wampa', 'battlefield-marine']
                    }
                });

                const { context } = contextRef;

                const resourceCount = context.player1.resources.length;
                const deckSize = context.player1.deck.length;

                // Deploy Mace Windu
                context.player1.clickCard(context.maceWindu);
                expect(context.player1).toHavePrompt('Choose an action for Mace Windu');
                context.player1.clickPrompt(deployPrompt);

                // Top card of the deck becomes an exhausted resource
                expect(context.maceWindu).toBeInZone('groundArena');
                expect(context.wampa).toBeInZone('resource');
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.battlefieldMarine).toBeInZone('deck');
                expect(context.player1.resources.length).toBe(resourceCount + 1);
                expect(context.player1.deck.length).toBe(deckSize - 1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deploy without effect when the deck is empty', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'mace-windu#here-with-backup',
                        deck: []
                    }
                });

                const { context } = contextRef;

                const resourceCount = context.player1.resources.length;

                // Deploy Mace Windu
                context.player1.clickCard(context.maceWindu);
                expect(context.player1).toHavePrompt('Choose an action for Mace Windu');
                context.player1.clickPrompt(deployPrompt);

                // Nothing is resourced
                expect(context.maceWindu).toBeInZone('groundArena');
                expect(context.player1.resources.length).toBe(resourceCount);
                expect(context.p1Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
