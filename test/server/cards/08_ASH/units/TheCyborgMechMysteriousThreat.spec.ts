describe('The Cyborg Mech, Mysterious Threat', function() {
    integration(function(contextRef) {
        it('The Cyborg Mech\'s ability should deal 2 damage to itself when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-cyborg-mech#mysterious-threat'],
                    groundArena: [{ card: 'darth-vader#commanding-the-first-legion', damage: 1 }, 'consular-security-force'],
                    spaceArena: ['soulless-one#swift-and-agile'],
                    leader: { card: 'boba-fett#collecting-the-bounty', deployed: true, damage: 1 }
                },
                player2: {
                    groundArena: ['wampa', { card: 'atst', damage: 1 }],
                    spaceArena: ['awing', { card: 'graceful-purrgil', damage: 1 }],
                    leader: { card: 'jango-fett#concealing-the-conspiracy', deployed: true, damage: 1 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theCyborgMech);
            context.player1.clickPrompt('Deal 2 damage to an undamaged ground unit');
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([context.theCyborgMech, context.consularSecurityForce, context.wampa]);
            context.player1.clickCard(context.theCyborgMech);

            expect(context.theCyborgMech.damage).toBe(2);
            expect(context.darthVader.damage).toBe(1);
            expect(context.consularSecurityForce.damage).toBe(0);
            expect(context.soullessOne.damage).toBe(0);
            expect(context.bobaFett.damage).toBe(1);
            expect(context.wampa.damage).toBe(0);
            expect(context.atst.damage).toBe(1);
            expect(context.awing.damage).toBe(0);
            expect(context.gracefulPurrgil.damage).toBe(1);
            expect(context.jangoFett.damage).toBe(1);
        });

        it('The Cyborg Mech\'s ability should deal 2 damage to an undamaged enemy ground unit when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-cyborg-mech#mysterious-threat'],
                    groundArena: [{ card: 'darth-vader#commanding-the-first-legion', damage: 1 }, 'consular-security-force'],
                    spaceArena: ['soulless-one#swift-and-agile'],
                    leader: { card: 'boba-fett#collecting-the-bounty', deployed: true, damage: 1 }
                },
                player2: {
                    groundArena: ['wampa', { card: 'atst', damage: 1 }],
                    spaceArena: ['awing', { card: 'graceful-purrgil', damage: 1 }],
                    leader: { card: 'jango-fett#concealing-the-conspiracy', deployed: true, damage: 1 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theCyborgMech);
            context.player1.clickPrompt('Deal 2 damage to an undamaged ground unit');
            expect(context.player1).toBeAbleToSelectExactly([context.theCyborgMech, context.consularSecurityForce, context.wampa]);
            context.player1.clickCard(context.wampa);

            expect(context.theCyborgMech.damage).toBe(0);
            expect(context.darthVader.damage).toBe(1);
            expect(context.consularSecurityForce.damage).toBe(0);
            expect(context.soullessOne.damage).toBe(0);
            expect(context.bobaFett.damage).toBe(1);
            expect(context.wampa.damage).toBe(2);
            expect(context.atst.damage).toBe(1);
            expect(context.awing.damage).toBe(0);
            expect(context.gracefulPurrgil.damage).toBe(1);
            expect(context.jangoFett.damage).toBe(1);
        });

        it('The Cyborg Mech\'s ability should deal 2 damage to an undamaged friendly ground unit when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-cyborg-mech#mysterious-threat'],
                    groundArena: [{ card: 'darth-vader#commanding-the-first-legion', damage: 1 }, 'consular-security-force'],
                    spaceArena: ['soulless-one#swift-and-agile'],
                    leader: { card: 'boba-fett#collecting-the-bounty', deployed: true, damage: 1 }
                },
                player2: {
                    groundArena: ['wampa', { card: 'atst', damage: 1 }],
                    spaceArena: ['awing', { card: 'graceful-purrgil', damage: 1 }],
                    leader: { card: 'jango-fett#concealing-the-conspiracy', deployed: true, damage: 1 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theCyborgMech);
            context.player1.clickPrompt('Deal 2 damage to an undamaged ground unit');
            expect(context.player1).toBeAbleToSelectExactly([context.theCyborgMech, context.consularSecurityForce, context.wampa]);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.theCyborgMech.damage).toBe(0);
            expect(context.darthVader.damage).toBe(1);
            expect(context.consularSecurityForce.damage).toBe(2);
            expect(context.soullessOne.damage).toBe(0);
            expect(context.bobaFett.damage).toBe(1);
            expect(context.wampa.damage).toBe(0);
            expect(context.atst.damage).toBe(1);
            expect(context.awing.damage).toBe(0);
            expect(context.gracefulPurrgil.damage).toBe(1);
            expect(context.jangoFett.damage).toBe(1);
        });

        it('The Cyborg Mech\'s ability should deal 2 damage to an undamaged friendly leader when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-cyborg-mech#mysterious-threat'],
                    groundArena: [{ card: 'darth-vader#commanding-the-first-legion', damage: 1 }, 'consular-security-force'],
                    spaceArena: ['soulless-one#swift-and-agile'],
                    leader: { card: 'boba-fett#collecting-the-bounty', deployed: true }
                },
                player2: {
                    groundArena: ['wampa', { card: 'atst', damage: 1 }],
                    spaceArena: ['awing', { card: 'graceful-purrgil', damage: 1 }],
                    leader: { card: 'jango-fett#concealing-the-conspiracy', deployed: true, damage: 1 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theCyborgMech);
            context.player1.clickPrompt('Deal 2 damage to an undamaged ground unit');
            expect(context.player1).toBeAbleToSelectExactly([context.theCyborgMech, context.consularSecurityForce, context.wampa, context.bobaFett]);
            context.player1.clickCard(context.bobaFett);

            expect(context.theCyborgMech.damage).toBe(0);
            expect(context.darthVader.damage).toBe(1);
            expect(context.consularSecurityForce.damage).toBe(0);
            expect(context.soullessOne.damage).toBe(0);
            expect(context.bobaFett.damage).toBe(2);
            expect(context.wampa.damage).toBe(0);
            expect(context.atst.damage).toBe(1);
            expect(context.awing.damage).toBe(0);
            expect(context.gracefulPurrgil.damage).toBe(1);
            expect(context.jangoFett.damage).toBe(1);
        });

        it('The Cyborg Mech\'s ability should deal 2 damage to an undamaged enemy leader unit when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-cyborg-mech#mysterious-threat'],
                    groundArena: [{ card: 'darth-vader#commanding-the-first-legion', damage: 1 }, 'consular-security-force'],
                    spaceArena: ['soulless-one#swift-and-agile'],
                    leader: { card: 'boba-fett#collecting-the-bounty', deployed: true, damage: 1 }
                },
                player2: {
                    groundArena: ['wampa', { card: 'atst', damage: 1 }],
                    spaceArena: ['awing', { card: 'graceful-purrgil', damage: 1 }],
                    leader: { card: 'jango-fett#concealing-the-conspiracy', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theCyborgMech);
            context.player1.clickPrompt('Deal 2 damage to an undamaged ground unit');
            expect(context.player1).toBeAbleToSelectExactly([context.theCyborgMech, context.consularSecurityForce, context.wampa, context.jangoFett]);
            context.player1.clickCard(context.jangoFett);

            expect(context.theCyborgMech.damage).toBe(0);
            expect(context.darthVader.damage).toBe(1);
            expect(context.consularSecurityForce.damage).toBe(0);
            expect(context.soullessOne.damage).toBe(0);
            expect(context.bobaFett.damage).toBe(1);
            expect(context.wampa.damage).toBe(0);
            expect(context.atst.damage).toBe(1);
            expect(context.awing.damage).toBe(0);
            expect(context.gracefulPurrgil.damage).toBe(1);
            expect(context.jangoFett.damage).toBe(2);
        });

        it('The Cyborg Mech\'s ability should deal 5 damage to a damaged enemy ground unit when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-cyborg-mech#mysterious-threat'],
                    groundArena: [{ card: 'darth-vader#commanding-the-first-legion', damage: 1 }, 'consular-security-force'],
                    spaceArena: ['soulless-one#swift-and-agile'],
                    leader: { card: 'boba-fett#collecting-the-bounty', deployed: true, damage: 1 }
                },
                player2: {
                    groundArena: ['wampa', { card: 'atst', damage: 1 }],
                    spaceArena: ['awing', { card: 'graceful-purrgil', damage: 1 }],
                    leader: { card: 'jango-fett#concealing-the-conspiracy', deployed: true, damage: 1 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theCyborgMech);
            context.player1.clickPrompt('Deal 5 damage to a damaged ground unit');
            expect(context.player1).toBeAbleToSelectExactly([context.darthVader, context.bobaFett, context.jangoFett, context.atst]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.atst);

            expect(context.theCyborgMech.damage).toBe(0);
            expect(context.darthVader.damage).toBe(1);
            expect(context.consularSecurityForce.damage).toBe(0);
            expect(context.soullessOne.damage).toBe(0);
            expect(context.bobaFett.damage).toBe(1);
            expect(context.wampa.damage).toBe(0);
            expect(context.atst.damage).toBe(6);
            expect(context.awing.damage).toBe(0);
            expect(context.gracefulPurrgil.damage).toBe(1);
            expect(context.jangoFett.damage).toBe(1);
        });

        it('The Cyborg Mech\'s ability should deal 5 damage to a damaged friendly ground unit when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-cyborg-mech#mysterious-threat'],
                    groundArena: [{ card: 'darth-vader#commanding-the-first-legion', damage: 1 }, 'consular-security-force'],
                    spaceArena: ['soulless-one#swift-and-agile'],
                    leader: { card: 'boba-fett#collecting-the-bounty', deployed: true, damage: 1 }
                },
                player2: {
                    groundArena: ['wampa', { card: 'atst', damage: 1 }],
                    spaceArena: ['awing', { card: 'graceful-purrgil', damage: 1 }],
                    leader: { card: 'jango-fett#concealing-the-conspiracy', deployed: true, damage: 1 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theCyborgMech);
            context.player1.clickPrompt('Deal 5 damage to a damaged ground unit');
            expect(context.player1).toBeAbleToSelectExactly([context.darthVader, context.bobaFett, context.jangoFett, context.atst]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.darthVader);

            expect(context.theCyborgMech.damage).toBe(0);
            expect(context.darthVader.damage).toBe(6);
            expect(context.consularSecurityForce.damage).toBe(0);
            expect(context.soullessOne.damage).toBe(0);
            expect(context.bobaFett.damage).toBe(1);
            expect(context.wampa.damage).toBe(0);
            expect(context.atst.damage).toBe(1);
            expect(context.awing.damage).toBe(0);
            expect(context.gracefulPurrgil.damage).toBe(1);
            expect(context.jangoFett.damage).toBe(1);
        });

        it('The Cyborg Mech\'s ability should deal 5 damage to a damaged enemy leader ground unit when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-cyborg-mech#mysterious-threat'],
                    groundArena: [{ card: 'darth-vader#commanding-the-first-legion', damage: 1 }, 'consular-security-force'],
                    spaceArena: ['soulless-one#swift-and-agile'],
                    leader: { card: 'boba-fett#collecting-the-bounty', deployed: true, damage: 1 }
                },
                player2: {
                    groundArena: ['wampa', { card: 'atst', damage: 1 }],
                    spaceArena: ['awing', { card: 'graceful-purrgil', damage: 1 }],
                    leader: { card: 'jango-fett#concealing-the-conspiracy', deployed: true, damage: 1 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theCyborgMech);
            context.player1.clickPrompt('Deal 5 damage to a damaged ground unit');
            expect(context.player1).toBeAbleToSelectExactly([context.darthVader, context.bobaFett, context.jangoFett, context.atst]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.jangoFett);

            expect(context.theCyborgMech.damage).toBe(0);
            expect(context.darthVader.damage).toBe(1);
            expect(context.consularSecurityForce.damage).toBe(0);
            expect(context.soullessOne.damage).toBe(0);
            expect(context.bobaFett.damage).toBe(1);
            expect(context.wampa.damage).toBe(0);
            expect(context.atst.damage).toBe(1);
            expect(context.awing.damage).toBe(0);
            expect(context.gracefulPurrgil.damage).toBe(1);
            expect(context.jangoFett.damage).toBe(6);
        });

        it('The Cyborg Mech\'s ability should deal 5 damage to a damaged friendly leader ground unit when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-cyborg-mech#mysterious-threat'],
                    groundArena: [{ card: 'darth-vader#commanding-the-first-legion', damage: 1 }, 'consular-security-force'],
                    spaceArena: ['soulless-one#swift-and-agile'],
                    leader: { card: 'boba-fett#collecting-the-bounty', deployed: true, damage: 1 }
                },
                player2: {
                    groundArena: ['wampa', { card: 'atst', damage: 1 }],
                    spaceArena: ['awing', { card: 'graceful-purrgil', damage: 1 }],
                    leader: { card: 'jango-fett#concealing-the-conspiracy', deployed: true, damage: 1 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theCyborgMech);
            context.player1.clickPrompt('Deal 5 damage to a damaged ground unit');
            expect(context.player1).toBeAbleToSelectExactly([context.darthVader, context.bobaFett, context.jangoFett, context.atst]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.bobaFett);

            expect(context.theCyborgMech.damage).toBe(0);
            expect(context.darthVader.damage).toBe(1);
            expect(context.consularSecurityForce.damage).toBe(0);
            expect(context.soullessOne.damage).toBe(0);
            expect(context.bobaFett.damage).toBe(6);
            expect(context.wampa.damage).toBe(0);
            expect(context.atst.damage).toBe(1);
            expect(context.awing.damage).toBe(0);
            expect(context.gracefulPurrgil.damage).toBe(1);
            expect(context.jangoFett.damage).toBe(1);
        });

        it('The Cyborg Mech\'s ability allow selecting the 5 damage option even without legal targets', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-cyborg-mech#mysterious-threat'],
                    groundArena: ['consular-security-force'],
                    spaceArena: ['soulless-one#swift-and-agile'],
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['awing', { card: 'graceful-purrgil', damage: 1 }],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theCyborgMech);
            context.player1.clickPrompt('(No effect) Deal 5 damage to a damaged ground unit');

            expect(context.theCyborgMech.damage).toBe(0);
            expect(context.consularSecurityForce.damage).toBe(0);
            expect(context.soullessOne.damage).toBe(0);
            expect(context.wampa.damage).toBe(0);
            expect(context.awing.damage).toBe(0);
            expect(context.gracefulPurrgil.damage).toBe(1);
        });
    });
});