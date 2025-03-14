describe('Chimaera, Reinforcing the Center', function() {
    integration(function(contextRef) {
        describe('Chimaera\'s When Playedability', function() {
            it('cannot trigger itself', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chimaera#reinforcing-the-center'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not defeat the selected unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chimaera#reinforcing-the-center'],
                        groundArena: ['wartime-trade-official']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);
                context.player1.clickCard(context.wartimeTradeOfficial);

                expect(context.player2).toBeActivePlayer();
                expect(context.wartimeTradeOfficial).toBeInZone('groundArena');
            });

            it('should trigger a friendly When Defeated ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chimaera#reinforcing-the-center'],
                        groundArena: ['wartime-trade-official', 'wampa']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);
                expect(context.player1).toBeAbleToSelectExactly([context.wartimeTradeOfficial]);
                context.player1.clickCard(context.wartimeTradeOfficial);

                expect(context.player2).toBeActivePlayer();
                const battleDroid = context.player1.findCardsByName('battle-droid');
                expect(battleDroid.length).toBe(1);
                expect(battleDroid[0]).toBeInZone('groundArena');
            });

            it('should let you select and activate a When Defeated ability gained from an upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chimaera#reinforcing-the-center'],
                        groundArena: [{ card: 'wampa', upgrades: ['droid-cohort'] }]
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                const battleDroid = context.player1.findCardsByName('battle-droid');
                expect(battleDroid.length).toBe(1);
                expect(battleDroid[0]).toBeInZone('groundArena');
            });

            it('should be able to select and trigger a When Defeated ability gained from another unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chimaera#reinforcing-the-center'],
                        groundArena: ['general-krell#heartless-tactician', 'battlefield-marine'],
                        deck: ['wampa']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.wampa).toBeInZone('hand');
            });

            it('should be able to select and trigger a When Defeated ability gained from an event', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chimaera#reinforcing-the-center', 'in-defense-of-kamino'],
                        spaceArena: ['padawan-starfighter']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.inDefenseOfKamino);
                context.player2.passAction();

                context.player1.clickCard(context.chimaera);
                expect(context.player1).toBeAbleToSelectExactly([context.padawanStarfighter]);
                context.player1.clickCard(context.padawanStarfighter);

                const cloneTrooper = context.player1.findCardsByName('clone-trooper');
                expect(cloneTrooper.length).toBe(1);
                expect(cloneTrooper[0]).toBeInZone('groundArena');
            });

            it('should let you choose between different When Defeated abilities on the same unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chimaera#reinforcing-the-center'],
                        spaceArena: [{ card: 'rhokai-gunship', upgrades: ['droid-cohort'] }]
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);
                context.player1.clickCard(context.rhokaiGunship);
                expect(context.player1).toHavePrompt('Choose a When Defeated ability to use');
                expect(context.player1).toHaveExactPromptButtons(['Deal 1 damage to a unit or base', 'Create a Battle Droid token.']);
                context.player1.clickPrompt('Create a Battle Droid token.');

                expect(context.player2).toBeActivePlayer();
                const battleDroid = context.player1.findCardsByName('battle-droid');
                expect(battleDroid.length).toBe(1);
                expect(battleDroid[0]).toBeInZone('groundArena');
            });

            it('should interact correctly with Superlaser Technician', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chimaera#reinforcing-the-center'],
                        groundArena: ['superlaser-technician']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);
                const readyResources = context.player1.readyResourceCount;
                context.player1.clickCard(context.superlaserTechnician);

                expect(context.chimaera).toBeInZone('spaceArena');
                expect(context.superlaserTechnician).toBeInZone('resource');
                expect(context.superlaserTechnician.exhausted).toBe(false);
                expect(context.player1.readyResourceCount).toBe(readyResources + 1);
            });

            it('should interact correctly with Enterprising Lackeys', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'iden-versio#inferno-squad-commander',
                        hand: ['chimaera#reinforcing-the-center'],
                        groundArena: ['enterprising-lackeys'],
                        resources: ['superlaser-technician', 'battlefield-marine', 'wild-rancor', 'protector', 'devotion', 'restored-arc170']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);
                context.player1.clickCard(context.enterprisingLackeys);
                expect(context.player1).toBeAbleToSelectExactly([context.superlaserTechnician, context.battlefieldMarine, context.wildRancor, context.protector, context.devotion, context.restoredArc170]);
                context.player1.clickCard(context.devotion);
                expect(context.devotion).toBeInZone('discard');
                expect(context.enterprisingLackeys).toBeInZone('resource');
                expect(context.enterprisingLackeys.exhausted).toBe(true);
            });

            it('should interact correctly with Shuttle ST-149', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chimaera#reinforcing-the-center'],
                        spaceArena: [{ card: 'shuttle-st149#under-krennics-authority', upgrades: ['shield'] }]
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);
                context.player1.clickCard(context.shuttleSt149);
                expect(context.player1).toBeAbleToSelectExactly([context.shield]);
                context.player1.clickCard(context.shield);
                expect(context.player1).toBeAbleToSelectExactly([context.chimaera]);
                context.player1.clickCard(context.chimaera);
                expect(context.shield).toBeAttachedTo(context.chimaera);
            });

            it('should interact correctly with a When Defeated that makes the opponent do something', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chimaera#reinforcing-the-center'],
                        spaceArena: ['zygerrian-starhopper']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);
                context.player1.clickCard(context.zygerrianStarhopper);

                expect(context.player1).toHaveEnabledPromptButtons(['You', 'Opponent']);
                context.player1.clickPrompt('Opponent');

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.p2Base]);
                expect(context.player2).not.toHaveChooseNoTargetButton();
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.wampa, 1],
                    [context.p2Base, 1]
                ]));

                expect(context.player2).toBeActivePlayer();
            });

            it('should not be able to select and trigger a When Defeated on an upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chimaera#reinforcing-the-center'],
                        groundArena: [{ card: 'wampa', upgrades: ['roger-roger'] }]
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger a bounty on a unit with a When Defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chimaera#reinforcing-the-center'],
                        groundArena: ['val#loyal-to-the-end']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);
                context.player1.clickCard(context.val);
                expect(context.player1).toBeAbleToSelectExactly([context.val, context.chimaera]);
                context.player1.clickCard(context.val);
                expect(context.val).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.player2).not.toHavePrompt('Deal 3 damage to a unit');
            });

            // TODO: This isn't currently working, also waiting on an answer from Judges
            // it('should interact correctly with Second Chance', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             base: 'kestro-city',
            //             hand: ['chimaera#reinforcing-the-center'],
            //             groundArena: [{ card: 'wampa', upgrades: ['second-chance'] }]
            //         },
            //         player2: {
            //             hand: ['rivals-fall', 'confiscate']
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.clickCard(context.chimaera);
            //     context.player1.clickCard(context.wampa);

            //     context.player2.clickCard(context.confiscate);
            //     context.player2.clickCard(context.secondChance);

            //     context.player1.passAction();

            //     context.player2.clickCard(context.rivalsFall);
            //     context.player2.clickCard(context.wampa);

            //     const p1ResourcesBefore = context.player1.readyResourceCount;
            //     expect(context.player1).toBeAbleToSelect(context.wampa);
            //     context.player1.clickCard(context.wampa);
            //     expect(context.player1.readyResourceCount).toBe(p1ResourcesBefore);
            //     expect(context.wampa).toBeInZone('groundArena');
            // });

            // TODO: Add a test that ensures Chimaera doesn't trigger Shadow Caster
            // TODO: Add a test that ensures Chimaera triggers JTL Thrawn
        });

        describe('Chimaera\'s When Defeated ability', function() {
            it('should create 2 TIE Fighters', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['chimaera#reinforcing-the-center'],
                    },
                    player2: {
                        hand: ['direct-hit']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.directHit);
                context.player2.clickCard(context.chimaera);

                const tieFighters = context.player1.findCardsByName('tie-fighter');
                expect(tieFighters.length).toBe(2);
                expect(tieFighters).toAllBeInZone('spaceArena');
                expect(tieFighters.every((tieFighter) => tieFighter.exhausted)).toBeTrue();
                expect(context.player2.getArenaCards().length).toBe(0);
            });
        });
    });
});
