describe('Zeb Orrelios, Headstrong Warrior', function () {
    integration(function (contextRef) {
        describe('Zeb Orrelios\'s ability', function () {
            it('should deal 4 damage to a ground unit when he kill someone and survives', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['zeb-orrelios#headstrong-warrior', 'swoop-racer'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['superlaser-technician', 'consular-security-force', 'steadfast-battalion'],
                    }
                });

                const { context } = contextRef;

                function reset(opponentPass = true) {
                    context.readyCard(context.zebOrrelios);
                    context.setDamage(context.zebOrrelios, 0);
                    if (opponentPass) {
                        context.player2.passAction();
                    }
                }

                // kill superlaser technician, should deal 4 to a ground unit
                context.player1.clickCard(context.zebOrrelios);
                context.player1.clickCard(context.superlaserTechnician);
                context.player2.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.zebOrrelios, context.swoopRacer, context.consularSecurityForce, context.steadfastBattalion]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();

                // reset
                context.setDamage(context.consularSecurityForce, 0);
                reset();

                // consular security force is not defeat, nothing happen
                context.player1.clickCard(context.zebOrrelios);
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.player2).toBeActivePlayer();

                // reset
                reset(false);

                // consular security force attack and die : nothing happen
                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.zebOrrelios);
                expect(context.player1).toBeActivePlayer();

                // zeb kill someone but die too, nothing happen
                context.player1.clickCard(context.zebOrrelios);
                context.player1.clickCard(context.steadfastBattalion);
                expect(context.player2).toBeActivePlayer();
            });


            it('should deal 4 damage to a ground unit when zeb attacks and kill with on attack abilities', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'zeb-orrelios#headstrong-warrior', upgrades: ['vambrace-flamethrower'] }]
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.zebOrrelios);
                context.player1.clickCard(context.battlefieldMarine);

                context.player1.clickPrompt('Trigger');

                // kill battlefield marine with flamethrower, zeb should deal 4 damage to another unit
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.battlefieldMarine, 3],
                ]));

                expect(context.player1).toBeAbleToSelectExactly([context.zebOrrelios, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should deal 4 damage to a ground unit when zeb attacks and kills a Leader with on attack abilities', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['zeb-orrelios#headstrong-warrior']
                },
                player2: {
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                    groundArena: ['wampa']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.zebOrrelios);
            context.player1.clickCard(context.sabineWren);

            context.player1.clickCard(context.wampa);

            expect(context.wampa.damage).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });

        it('should do nothing if the defender was previously defeated and played again before his attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rivals-fall'],
                    groundArena: [{ card: 'escort-skiff', damage: 3 }, 'zeb-orrelios#headstrong-warrior'],
                },
                player2: {
                    hand: ['the-emperors-legion'],
                    groundArena: ['consular-security-force'],
                }
            });

            const { context } = contextRef;

            // kill consular security done
            context.player1.clickCard(context.rivalsFall);
            context.player1.clickCard(context.consularSecurityForce);

            // play again consular security force
            context.player2.clickCard(context.theEmperorsLegion);
            context.player1.passAction();
            context.player2.clickCard(context.consularSecurityForce);

            // Zeb doesn't defeat, nothing happens
            context.player1.clickCard(context.zebOrrelios);
            context.player1.clickCard(context.consularSecurityForce);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
