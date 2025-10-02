describe('Unrefusable Offer', function () {
    integration(function (contextRef) {
        it('Unrefusable Offer\'s Bounty ability should play defeated unit (enters ready) and defeat it at the start of regroup phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['unrefusable-offer'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.unrefusableOffer);
            context.player1.clickCard(context.battlefieldMarine);

            context.player2.passAction();

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it');
            context.player1.clickPrompt('Trigger');

            expect(context.battlefieldMarine).toBeInZone('groundArena');
            expect(context.battlefieldMarine.exhausted).toBeFalse();

            context.setDamage(context.p2Base, 0);
            context.player2.passAction();

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(3);

            context.moveToNextActionPhase();
            expect(context.battlefieldMarine).toBeInZone('discard');
        });

        it('Unrefusable Offer\'s Bounty ability should play defeated unit (enters ready) and defeat it at the start of regroup phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['unrefusable-offer'],
                    groundArena: ['wampa'],
                },
                player2: {
                    hand: ['battle-droid-escort']
                }
            });

            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context.battleDroidEscort);

            const battleDroid = context.player2.findCardByName('battle-droid');

            context.player1.clickCard(context.unrefusableOffer);
            context.player1.clickCard(battleDroid);

            context.player2.passAction();

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(battleDroid);

            // todo skip this trigger
            expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it');
            context.player1.clickPrompt('Trigger');
            expect(context.player2).toBeActivePlayer();

            expect(context.player1.spaceArena).toEqual([]);

            context.moveToNextActionPhase();

            expect(context.wampa).toBeInZone('groundArena');
            expect(context.battleDroidEscort).toBeInZone('groundArena');
        });

        it('Unrefusable Offer\'s Bounty ability should play defeated unit (enters ready) and defeat it at the start of regroup phase (from capture)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['unrefusable-offer', 'take-captive'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.unrefusableOffer);
            context.player1.clickCard(context.battlefieldMarine);

            context.player2.passAction();

            context.player1.clickCard(context.takeCaptive);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeCapturedBy(context.wampa);
            expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it');
            context.player1.clickPrompt('Trigger');

            expect(context.battlefieldMarine).toBeInZone('groundArena');
            expect(context.battlefieldMarine.exhausted).toBeFalse();

            context.setDamage(context.p2Base, 0);
            context.player2.passAction();

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(3);

            context.moveToNextActionPhase();
            expect(context.battlefieldMarine).toBeInZone('discard');
        });

        it('Unrefusable Offer\'s Bounty ability should play defeated unit (enters ready) and defeat it at the start of regroup phase (was defeated earlier)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['unrefusable-offer'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['battlefield-marine', 'atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.unrefusableOffer);
            context.player1.clickCard(context.battlefieldMarine);

            context.player2.passAction();

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it');
            context.player1.clickPrompt('Trigger');

            expect(context.battlefieldMarine).toBeInZone('groundArena');
            expect(context.battlefieldMarine.exhausted).toBeFalse();

            context.setDamage(context.p2Base, 0);
            context.player2.passAction();

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.atst);
            expect(context.battlefieldMarine).toBeInZone('discard');

            context.moveToNextActionPhase();

            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.atst).toBeInZone('groundArena');
            expect(context.wampa).toBeInZone('groundArena');
        });

        it('Unrefusable Offer\'s Bounty ability should play defeated unit (enters ready) and defeat it at the start of regroup phase (was defeated and played again earlier, should not defeat it)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['unrefusable-offer'],
                    groundArena: ['wampa'],
                },
                player2: {
                    hand: ['spark-of-hope'],
                    groundArena: ['battlefield-marine', 'atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.unrefusableOffer);
            context.player1.clickCard(context.battlefieldMarine);

            context.player2.passAction();

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it');
            context.player1.clickPrompt('Trigger');

            expect(context.battlefieldMarine).toBeInZone('groundArena');
            expect(context.battlefieldMarine.exhausted).toBeFalse();

            context.setDamage(context.p2Base, 0);
            context.player2.passAction();

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.atst);
            expect(context.battlefieldMarine).toBeInZone('discard');

            context.player2.clickCard(context.sparkOfHope);
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeInZone('resource');

            context.moveToNextActionPhase();

            expect(context.battlefieldMarine).toBeInZone('resource');
            expect(context.atst).toBeInZone('groundArena');
            expect(context.wampa).toBeInZone('groundArena');
        });

        it('should not bug if the unit is defeated because of the uniqueness rule', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['unrefusable-offer'],
                    groundArena: ['sabine-wren#explosives-artist'],
                },
                player2: {
                    groundArena: ['sabine-wren#explosives-artist']
                }
            });

            const { context } = contextRef;

            context.p1SabineWren = context.player1.findCardByName('sabine-wren#explosives-artist');
            context.p2SabineWren = context.player2.findCardByName('sabine-wren#explosives-artist');

            context.player1.clickCard(context.unrefusableOffer);
            context.player1.clickCard(context.p2SabineWren);

            context.player2.passAction();

            context.player1.clickCard(context.p1SabineWren);
            context.player1.clickCard(context.p2SabineWren);
            context.player1.clickCard(context.p2SabineWren);
            expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it');
            context.player1.clickPrompt('Trigger');

            context.player1.clickCard(context.p2SabineWren); // Choose to defeat the one played with Unrefusable Offer
            expect(context.p2SabineWren).toBeInZone('discard');

            context.moveToNextActionPhase();
        });

        it('should do nothing if the bounty is not collected', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['unrefusable-offer'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['sabine-wren#explosives-artist'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.unrefusableOffer);
            context.player1.clickCard(context.sabineWren);

            context.player2.passAction();

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.sabineWren);
            expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it');
            context.player1.clickPrompt('Pass');

            expect(context.sabineWren).toBeInZone('discard');
        });

        // TODO FIX MULTIPLE TRIGGER WHICH PLAY THE SAME CARD
        // it('Unrefusable Offer\'s Bounty ability should play defeated unit (enters ready) and defeat it at the start of regroup phase', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             hand: ['unrefusable-offer'],
        //             groundArena: ['wampa'],
        //         },
        //         player2: {
        //             groundArena: ['superlaser-technician']
        //         }
        //     });
        //
        //     const { context } = contextRef;
        //
        //     context.player1.clickCard(context.unrefusableOffer);
        //     context.player1.clickCard(context.superlaserTechnician);
        //
        //     context.player2.passAction();
        //
        //     context.player1.clickCard(context.wampa);
        //     context.player1.clickCard(context.superlaserTechnician);
        //     context.player1.clickPrompt('You');
        //     expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it');
        //     context.player1.clickPrompt('Trigger');
        //
        //     expect(context.player2).toBeActivePlayer();
        //     expect(context.superlaserTechnician).toBeInZone('groundArena');
        //     expect(context.superlaserTechnician.exhausted).toBeFalse();
        //
        //     context.setDamage(context.p2Base, 0);
        //     context.player2.passAction();
        //
        //     context.player1.clickCard(context.superlaserTechnician);
        //     context.player1.clickCard(context.p2Base);
        //     expect(context.p2Base.damage).toBe(3);
        //
        //     context.moveToNextActionPhase();
        //     expect(context.superlaserTechnician).toBeInZone('discard');
        // });
    });
});
