describe('Miraj Scintel, The Weak Deserve to Kneel', function () {
    integration(function (contextRef) {
        it('Miraj Scintel\'s when played ability may deals 3 damage to an undamaged unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['miraj-scintel#the-weak-deserve-to-kneel'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa', { card: 'specforce-soldier', damage: 1 }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.mirajScintel);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.mirajScintel]);
            expect(context.player1).toHavePassAbilityButton();

            // Choose target and resolve damage
            context.player1.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });

        it('Miraj Scintel\'s constant ability grants Overwhelm while a friendly unit is attacking a damaged unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['miraj-scintel#the-weak-deserve-to-kneel', 'battlefield-marine']
                },
                player2: {
                    groundArena: [{ card: 'wookiee-warrior', damage: 4 }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.wookieeWarrior);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(2);
        });

        it('Miraj Scintel\'s constant ability does not grant Overwhelm if the target is undamaged', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['miraj-scintel#the-weak-deserve-to-kneel', 'battlefield-marine']
                },
                player2: {
                    groundArena: ['specforce-soldier']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.specforceSoldier);
            expect(context.p2Base.damage).toBe(0);
        });

        it('Miraj Scintel\'s constant ability grants Overwhelm to Darth Maul when he attacks two units including a damaged one', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['miraj-scintel#the-weak-deserve-to-kneel', 'darth-maul#revenge-at-last']
                },
                player2: {
                    groundArena: ['moisture-farmer', { card: 'cantina-braggart', damage: 1 }]
                }
            });

            const { context } = contextRef;

            // Attack both units with Maul; one of them is damaged, so Miraj should grant Overwhelm
            context.player1.clickCard(context.darthMaul);
            // multi-select: choose both defenders then Done
            context.player1.clickCard(context.moistureFarmer);
            context.player1.clickCard(context.cantinaBraggart);
            context.player1.clickDone();

            // Both should be defeated (Maul power 5) and some Overwhelm damage should be dealt to base
            expect(context.moistureFarmer).toBeInZone('discard');
            expect(context.cantinaBraggart).toBeInZone('discard');
            expect(context.p2Base.damage).toBe(4);
        });
    });
});
