describe('The Daughter, Embodiment of Light', () => {
    integration(function (contextRef) {
        describe('When damage is dealt to your base', () => {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-daughter#embodiment-of-light', 'battlefield-marine'],
                        base: 'nightsister-lair',
                        hasForceToken: true,
                    },
                    player2: {
                        hand: ['daring-raid'],
                        groundArena: ['atst', 'wampa'],
                        hasInitiative: true,
                    }
                });
            });


            it('may allow the player to use the force. If they do, heal 2 damage from your base', () => {
                const { context } = contextRef;

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toHavePassAbilityPrompt('Use the Force to heal 2 damage from your base');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeActivePlayer();
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.p1Base.damage).toBe(4);

                context.player1.passAction();

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(8);
            });

            it('may allow the player to use the force. If they do, heal 2 damage from your base', () => {
                const { context } = contextRef;

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toHavePassAbilityPrompt('Use the Force to heal 2 damage from your base');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeActivePlayer();
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.p1Base.damage).toBe(4);

                context.player1.clickCard(context.theDaughter);
                context.player1.clickCard(context.p2Base);

                expect(context.player1.hasTheForce).toBeTrue();

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePassAbilityPrompt('Use the Force to heal 2 damage from your base');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(3);
            });

            it('may allow the player to use the force. If they do, heal 2 damage from your base', () => {
                const { context } = contextRef;

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toHavePassAbilityPrompt('Use the Force to heal 2 damage from your base');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeActivePlayer();
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.p1Base.damage).toBe(0);
            });

            it('may allow the player to use the force. If they do, heal 2 damage from your base', () => {
                const { context } = contextRef;

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.theDaughter);

                expect(context.player1).toBeActivePlayer();
                expect(context.player1.hasTheForce).toBeTrue();
                expect(context.theDaughter.damage).toBe(2);
            });
        });
    });
});