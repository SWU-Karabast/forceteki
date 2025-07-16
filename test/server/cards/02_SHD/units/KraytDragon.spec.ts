describe('Krayt Dragon', function () {
    integration(function (contextRef) {
        describe('Krayt Dragon\'s ability', function () {
            it('should deal damage to ground unit or base when enemy play a card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                        groundArena: ['krayt-dragon'],
                    },
                    player2: {
                        hand: ['superlaser-blast', 'privateer-crew', 'green-squadron-awing'],
                        groundArena: ['wampa'],
                        resources: ['hotshot-dl44-blaster', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst']
                    },
                });

                const { context } = contextRef;

                // play a card, nothing happen
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();

                // enemy play a space unit, should deal damage to ground unit or base
                context.player2.clickCard(context.greenSquadronAwing);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(2);

                // enemy play a ground unit, should deal damage to ground unit or base
                context.player1.passAction();
                context.player2.clickCard(context.privateerCrew);

                // should choose which player resolve their triggers first
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.wampa, context.privateerCrew]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);

                // for smuggle, should take the printed cost
                context.setDamage(context.p2Base, 0);
                context.player1.passAction();
                context.player2.clickCard(context.hotshotDl44Blaster);
                // resolve hotshot blaster first
                context.player2.clickCard(context.wampa);
                context.player2.clickPrompt('You');
                context.player2.clickCard(context.p1Base);

                // 1 damage on base (3 paid from smuggle but 1 for printed cost)
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.wampa, context.privateerCrew]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(1);

                context.setDamage(context.p2Base, 0);
                // enemy kill everyone, krayt ability still activates
                context.player1.passAction();
                context.player2.clickCard(context.superlaserBlast);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(8);
            });

            it('should work correctly with Change of Heart', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine', 'change-of-heart'],
                    },
                    player2: {
                        hand: ['green-squadron-awing'],
                        groundArena: ['krayt-dragon'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.kraytDragon);
                expect(context.kraytDragon).toBeInZone('groundArena', context.player1);
                expect(context.player2).toHavePrompt('Deal damage equal to that card\'s cost to their base or a ground unit they control');
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.kraytDragon]);

                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(6);

                context.player2.clickCard(context.greenSquadronAwing);
                expect(context.player1).toHavePrompt('Deal damage equal to that card\'s cost to their base or a ground unit they control');
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);

                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();
            });

            it('should work correctly with Choose Sides', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['choose-sides'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        hand: ['green-squadron-awing'],
                        groundArena: ['krayt-dragon'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chooseSides);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.kraytDragon);
                expect(context.kraytDragon).toBeInZone('groundArena', context.player1);
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);
                expect(context.player2).toHavePrompt('Deal damage equal to that card\'s cost to their base or a ground unit they control');
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.kraytDragon]);

                context.player2.clickCard(context.kraytDragon);
                expect(context.kraytDragon.damage).toBe(7);

                context.player2.clickCard(context.greenSquadronAwing);
                expect(context.player1).toHavePrompt('Deal damage equal to that card\'s cost to their base or a ground unit they control');
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.battlefieldMarine]);

                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);
            });

            it('should work correctly with U-Wing Reinforcement', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['uwing-reinforcement'],
                        deck: [
                            'wampa',
                            'vanguard-infantry',
                            'battlefield-marine',
                            'hunting-nexu',
                            'cartel-turncoat',
                            'daring-raid',
                            'protector',
                            'strike-true',
                            'atat-suppressor',
                            'aurra-sing#crackshot-sniper',
                            'atst'
                        ],
                    },
                    player2: {
                        groundArena: ['krayt-dragon'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.uwingReinforcement);
                context.player1.clickCardInDisplayCardPrompt(context.wampa);
                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
                context.player1.clickCardInDisplayCardPrompt(context.vanguardInfantry);
                context.player1.clickPrompt('Play cards in selection order');

                // Trigger for Wampa
                expect(context.player2).toHavePrompt('Deal damage equal to that card\'s cost to their base or a ground unit they control');
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.wampa]);
                context.player2.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(4);

                // Trigger for Battlefield Marine
                expect(context.player2).toHavePrompt('Deal damage equal to that card\'s cost to their base or a ground unit they control');
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.wampa, context.battlefieldMarine]);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.damage).toBe(2);

                // // Trigger for Vanguard Infantry
                expect(context.player2).toHavePrompt('Deal damage equal to that card\'s cost to their base or a ground unit they control');
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.wampa, context.battlefieldMarine, context.vanguardInfantry]);
                context.player2.clickCardNonChecking(context.vanguardInfantry);
                expect(context.vanguardInfantry.damage).toBe(1);

                // Trigger for U-Wing Reinforcement
                expect(context.player2).toHavePrompt('Deal damage equal to that card\'s cost to their base or a ground unit they control');
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.wampa, context.battlefieldMarine, context.vanguardInfantry]);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(7);
            });

            it('should work correctly with Clone', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        hand: ['clone'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        hand: ['green-squadron-awing'],
                        groundArena: ['krayt-dragon'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.kraytDragon);
                expect(context.clone).toBeCloneOf(context.kraytDragon);
                expect(context.player2).toHavePrompt('Deal damage equal to that card\'s cost to their base or a ground unit they control');
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.battlefieldMarine, context.clone]);

                context.player2.clickCard(context.clone);
                expect(context.clone.damage).toBe(9);

                context.player2.clickCard(context.greenSquadronAwing);
                expect(context.player1).toHavePrompt('Deal damage equal to that card\'s cost to their base or a ground unit they control');
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.kraytDragon]);

                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);
            });
        });
    });
});
