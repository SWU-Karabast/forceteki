describe('Ben Kenobi, Don\'t Be Afraid', function() {
    integration(function(contextRef) {
        it('Ben Kenobi\'s when played ability should exhaust a unit with 3 or less power', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ben-kenobi#dont-be-afraid'],
                    groundArena: ['battlefield-marine'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true }
                },
                player2: {
                    groundArena: ['gungi#finding-himself']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.benKenobi);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cadBane, context.gungi]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.gungi);

            expect(context.battlefieldMarine.exhausted).toBeFalse();
            expect(context.cadBane.exhausted).toBeFalse();
            expect(context.benKenobi.exhausted).toBeTrue();
            expect(context.gungi.exhausted).toBeTrue();
        });

        it('Ben Kenobi\'s when played ability should be able to be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ben-kenobi#dont-be-afraid'],
                    groundArena: ['battlefield-marine'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true }
                },
                player2: {
                    groundArena: ['gungi#finding-himself']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.benKenobi);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cadBane, context.gungi]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');

            expect(context.battlefieldMarine.exhausted).toBeFalse();
            expect(context.cadBane.exhausted).toBeFalse();
            expect(context.benKenobi.exhausted).toBeTrue();
            expect(context.gungi.exhausted).toBeFalse();
        });

        it('Ben Kenobi\'s on attack ability should heal 3 damage from another unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine', 'ben-kenobi#dont-be-afraid'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true, damage: 4 }
                },
                player2: {
                    groundArena: [{ card: 'gungi#finding-himself', damage: 4 }]
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.benKenobi);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cadBane, context.gungi]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.cadBane);

            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.cadBane.damage).toBe(1);
            expect(context.benKenobi.damage).toBe(0);
            expect(context.gungi.damage).toBe(4);
        });

        it('Ben Kenobi\'s on attack ability should be able to be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine', 'ben-kenobi#dont-be-afraid'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true, damage: 4 }
                },
                player2: {
                    groundArena: [{ card: 'gungi#finding-himself', damage: 4 }]
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.benKenobi);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cadBane, context.gungi]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');

            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.cadBane.damage).toBe(4);
            expect(context.benKenobi.damage).toBe(0);
            expect(context.gungi.damage).toBe(4);
        });
    });
});