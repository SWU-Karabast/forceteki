describe('Betrayed Trust', function () {
    integration(function (contextRef) {
        it('an enemy unit cannot deal combat damage to bases for the phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['betrayed-trust']
                },
                player2: {
                    leader: { card: 'darth-vader#unstoppable', deployed: true },
                    groundArena: ['atst'],
                }
            });

            const { context } = contextRef;

            // P1 plays Betrayed Trust on AT-ST
            context.player1.clickCard(context.betrayedTrust);
            expect(context.player1).toHavePrompt('An enemy unit can\'t deal combat damage for this phase');
            expect(context.player1).toBeAbleToSelectExactly([
                context.darthVader, // Can target leaders
                context.atst
            ]);
            context.player1.clickCard(context.atst);
            expect(context.getChatLog()).toEqual('player1 plays Betrayed Trust to prevent AT-ST from dealing combat damage for this phase');

            // P2 attacks base with AT-ST, but it deals no combat damage
            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(0);

            context.moveToNextActionPhase();

            // Next action phase, the effect has expired
            context.player1.passAction();
            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(6);
        });

        it('an enemy unit cannot deal combat damage to units for the phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['betrayed-trust'],
                    groundArena: ['consular-security-force']
                },
                player2: {
                    leader: { card: 'darth-vader#unstoppable', deployed: true },
                    groundArena: ['atst'],
                }
            });

            const { context } = contextRef;

            // P1 plays Betrayed Trust on AT-ST
            context.player1.clickCard(context.betrayedTrust);
            context.player1.clickCard(context.atst);

            // P2 attacks Consular Security Force with AT-ST, but it deals no combat damage
            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.consularSecurityForce);
            expect(context.consularSecurityForce.damage).toBe(0);
            expect(context.atst.damage).toBe(3);

            // P1 attacks AT-ST with Consular Security Force, AT-ST deals no combat damage back
            context.player1.clickCard(context.consularSecurityForce);
            context.player1.clickCard(context.atst);
            expect(context.consularSecurityForce.damage).toBe(0);
            expect(context.atst.damage).toBe(6);
        });

        it('units that get a stat buff for an attack still deal no combat damage', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['betrayed-trust'],
                },
                player2: {
                    hand: ['surprise-strike'],
                    groundArena: ['atst'],
                }
            });

            const { context } = contextRef;

            // P1 plays Betrayed Trust on AT-ST
            context.player1.clickCard(context.betrayedTrust);
            context.player1.clickCard(context.atst);

            // P2 plays Surprise Strike on AT-ST to give it +3 power for the attack
            context.player2.clickCard(context.surpriseStrike);
            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.p1Base);

            // No combat damage is dealt
            expect(context.p1Base.damage).toBe(0);
        });

        it('units that deal damage equal to their remaining HP still deal no combat damage', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['betrayed-trust'],
                },
                player2: {
                    leader: { card: 'c3po#humancyborg-relations', deployed: true },
                    groundArena: ['babu-frik#heyyy']
                }
            });

            const { context } = contextRef;

            // P1 plays Betrayed Trust on C-3PO
            context.player1.clickCard(context.betrayedTrust);
            context.player1.clickCard(context.c3po);

            // P2 uses Babu Frik's ability to attack with C-3PO, which would normally deal damage equal to its remaining HP
            context.player2.clickCard(context.babuFrik);
            context.player2.clickPrompt('Attack with a friendly Droid unit. For this attack, it deals damage equal to its remaining HP instead of its power.');
            context.player2.clickCard(context.c3po);
            context.player2.clickCard(context.p1Base);
            context.player2.clickPrompt('Pass'); // Pass on C-3PO's attack trigger

            // No combat damage is dealt
            expect(context.p1Base.damage).toBe(0);
        });

        it('has no effect if there are no enemy units in play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['betrayed-trust'],
                }
            });

            const { context } = contextRef;

            // P1 plays Betrayed Trust, but there are no enemy units to target
            context.player1.clickCard(context.betrayedTrust);
            expect(context.player1).toHavePrompt('Playing Betrayed Trust will have no effect. Are you sure you want to play it?');
            context.player1.clickPrompt('Play anyway');
        });

        it('does not affect the unit\'s power for effects that care about power', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['betrayed-trust'],
                    groundArena: ['consular-security-force'],
                },
                player2: {
                    hand: ['strike-true'],
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            // P1 plays Betrayed Trust on AT-ST
            context.player1.clickCard(context.betrayedTrust);
            context.player1.clickCard(context.atst);

            // P2 plays Strike True to have AT-ST deal damage equal to its power to Consular Security Force
            context.player2.clickCard(context.strikeTrue);
            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.consularSecurityForce);

            // Consular Security Force takes damage equal to AT-ST's power
            expect(context.consularSecurityForce.damage).toBe(6);
        });

        it('does not prevent the unit from dealing non-combat damage', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['betrayed-trust'],
                    groundArena: ['consular-security-force'],
                },
                player2: {
                    groundArena: ['bendu#do-you-fear-the-storm']
                }
            });

            const { context } = contextRef;

            // P1 plays Betrayed Trust on Bendu
            context.player1.clickCard(context.betrayedTrust);
            context.player1.clickCard(context.bendu);

            // P2 attacks base with Bendu, dealing 3 damage to Consular Security Force on attack
            context.player2.clickCard(context.bendu);
            context.player2.clickCard(context.p1Base);

            // No conbat damage, but ability damage is dealt
            expect(context.p1Base.damage).toBe(0);
            expect(context.consularSecurityForce.damage).toBe(3);
        });

        it('prevents combat damage from being dealt to Vigil', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['betrayed-trust'],
                    spaceArena: ['vigil#securing-the-future']
                },
                player2: {
                    spaceArena: ['ruthless-raider']
                }
            });

            const { context } = contextRef;

            // P1 plays Betrayed Trust on Ruthless Raider
            context.player1.clickCard(context.betrayedTrust);
            context.player1.clickCard(context.ruthlessRaider);

            // P2 attacks Vigil with Ruthless Raider, but it deals no combat damage
            context.player2.clickCard(context.ruthlessRaider);
            context.player2.clickCard(context.vigil);
            expect(context.vigil.damage).toBe(0);
            expect(context.ruthlessRaider.damage).toBe(5);
        });

        describe('cases with multiple attack targets', function () {
            it('it works on units that can attack multiple units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['betrayed-trust'],
                        groundArena: ['consular-security-force', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['darth-maul#revenge-at-last']
                    }
                });

                const { context } = contextRef;

                // P1 plays Betrayed Trust on Darth Maul
                context.player1.clickCard(context.betrayedTrust);
                context.player1.clickCard(context.darthMaul);

                // P2 attacks both units with Darth Maul
                context.player2.clickCard(context.darthMaul);
                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickDone();

                // No combat damage is dealt to either unit
                expect(context.consularSecurityForce.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.darthMaul).toBeInZone('discard'); // Defeated by taking 6 damage
            });

            it('works if the chosen unit is one of two attack targets', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['betrayed-trust'],
                        groundArena: ['darth-maul#revenge-at-last'],
                    },
                    player2: {
                        groundArena: ['consular-security-force', 'battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                // P1 plays Betrayed Trust on Consular Security Force
                context.player1.clickCard(context.betrayedTrust);
                context.player1.clickCard(context.consularSecurityForce);
                context.player2.passAction();

                // P1 attacks both units with Darth Maul
                context.player1.clickCard(context.darthMaul);
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickDone();

                // No combat damage is dealt by Consular Security Force
                expect(context.darthMaul.damage).toBe(3); // Only takes damage from Battlefield Marine
                expect(context.consularSecurityForce.damage).toBe(5);
                expect(context.battlefieldMarine).toBeInZone('discard'); // Defeated by combat damage
            });

            it('works if both attack targets have the effect applied to them', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['betrayed-trust', 'betrayed-trust'],
                        groundArena: ['darth-maul#revenge-at-last'],
                    },
                    player2: {
                        groundArena: ['consular-security-force', 'battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                const [betrayedTrust1, betrayedTrust2] = context.player1.findCardsByName('betrayed-trust');

                // P1 plays Betrayed Trust on Consular Security Force
                context.player1.clickCard(betrayedTrust1);
                context.player1.clickCard(context.consularSecurityForce);
                context.player2.passAction();

                // P1 plays Betrayed Trust on Battlefield Marine
                context.player1.clickCard(betrayedTrust2);
                context.player1.clickCard(context.battlefieldMarine);
                context.player2.passAction();

                // P1 attacks both units with Darth Maul
                context.player1.clickCard(context.darthMaul);
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickDone();

                // No combat damage is dealt by either unit
                expect(context.darthMaul.damage).toBe(0);
                expect(context.consularSecurityForce.damage).toBe(5);
                expect(context.battlefieldMarine).toBeInZone('discard'); // Defeated by combat damage
            });
        });
    });
});