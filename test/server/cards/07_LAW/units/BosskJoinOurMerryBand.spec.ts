describe('Bossk, Join Our Merry Band', function () {
    integration(function (contextRef) {
        describe('Bossk\'s on attack ability', function () {
            it('should deal 1 damage to a ground unit if the discarded card is Aggression', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['bossk#join-our-merry-band', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        groundArena: ['greedo#slow-on-the-draw', 'atst'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'aurra-sing#assassin', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bossk);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHavePrompt('Choose a unit to give +1/+1 to for this phase');
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.bossk, context.battlefieldMarine, context.greenSquadronAwing, context.greedo, context.atst, context.aurraSing, context.cartelSpacer]);

                // Give +1/+1 to Bossk
                context.player1.clickCard(context.bossk);

                expect(context.player1).toHavePrompt('Choose a unit to give -1/-1 to for this phase');
                expect(context.player1).toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([context.bossk, context.battlefieldMarine, context.greenSquadronAwing, context.greedo, context.atst, context.aurraSing, context.cartelSpacer]);

                // Give -1/-1 to Cartel Spacer
                context.player1.clickCard(context.cartelSpacer);

                expect(context.bossk.getPower()).toBe(4);
                expect(context.bossk.getHp()).toBe(6);
                expect(context.cartelSpacer.getPower()).toBe(1);
                expect(context.cartelSpacer.getHp()).toBe(2);
                expect(context.p2Base.damage).toBe(4);

                // Ensure that the effect is only for this phase
                context.moveToRegroupPhase();

                expect(context.bossk.getPower()).toBe(3);
                expect(context.bossk.getHp()).toBe(5);

                expect(context.cartelSpacer.getPower()).toBe(2);
                expect(context.cartelSpacer.getHp()).toBe(3);
            });
        });
    });
});