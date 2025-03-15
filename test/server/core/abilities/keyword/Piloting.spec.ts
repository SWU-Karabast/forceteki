describe('Piloting keyword', function() {
    integration(function(contextRef) {
        describe('When a unit with a Piloting cost is played', function() {
            it('it can be played as a unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jyn-erso#resisting-oppression',
                        hand: ['dagger-squadron-pilot'],
                        spaceArena: ['concord-dawn-interceptors'],
                    }
                });

                const { context } = contextRef;

                const p1Resources = context.player1.readyResourceCount;
                context.player1.clickCard(context.daggerSquadronPilot);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Play Dagger Squadron Pilot', 'Play Dagger Squadron Pilot with Piloting']);
                context.player1.clickPrompt('Play Dagger Squadron Pilot');
                expect(context.player1.readyResourceCount).toBe(p1Resources - 1);
                expect(context.daggerSquadronPilot).toBeInZone('groundArena');
            });

            it('it can be played as an upgrade on a friendly vehicle', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jyn-erso#resisting-oppression',
                        hand: ['dagger-squadron-pilot'],
                        groundArena: ['wampa', 'falchion-ion-tank'],
                        spaceArena: ['concord-dawn-interceptors'],
                    }
                });

                const { context } = contextRef;

                const p1Resources = context.player1.readyResourceCount;
                context.player1.clickCard(context.daggerSquadronPilot);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Play Dagger Squadron Pilot', 'Play Dagger Squadron Pilot with Piloting']);
                context.player1.clickPrompt('Play Dagger Squadron Pilot with Piloting');
                expect(context.player1).toBeAbleToSelectExactly([context.concordDawnInterceptors, context.falchionIonTank]);
                context.player1.clickCard(context.concordDawnInterceptors);
                expect(context.daggerSquadronPilot).toBeAttachedTo(context.concordDawnInterceptors);
                expect(context.concordDawnInterceptors.getPower()).toBe(3);
                expect(context.concordDawnInterceptors.getHp()).toBe(5);
                expect(context.player1.readyResourceCount).toBe(p1Resources - 1);
                expect(context.daggerSquadronPilot).toBeInZone('spaceArena');
            });

            it('it correctly has its unit stats when in play as a unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jyn-erso#resisting-oppression',
                        hand: ['chewbacca#faithful-first-mate'],
                        groundArena: ['wampa', 'falchion-ion-tank'],
                        spaceArena: ['concord-dawn-interceptors'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Play Chewbacca', 'Play Chewbacca with Piloting']);
                context.player1.clickPrompt('Play Chewbacca');

                // Should be a 5/6 ground unit
                expect(context.chewbacca).toBeInZone('groundArena');
                expect(context.chewbacca.getPower()).toBe(5);
                expect(context.chewbacca.getHp()).toBe(6);
            });

            it('it correctly adds its upgrade stat modifiers, not its unit ones', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jyn-erso#resisting-oppression',
                        hand: ['chewbacca#faithful-first-mate'],
                        groundArena: ['wampa', 'falchion-ion-tank'],
                        spaceArena: ['concord-dawn-interceptors'],
                    }
                });

                const { context } = contextRef;

                const p1Resources = context.player1.readyResourceCount;
                context.player1.clickCard(context.chewbacca);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Play Chewbacca', 'Play Chewbacca with Piloting']);
                context.player1.clickPrompt('Play Chewbacca with Piloting');
                expect(context.player1).toBeAbleToSelectExactly([context.concordDawnInterceptors, context.falchionIonTank]);
                context.player1.clickCard(context.concordDawnInterceptors);

                // Should turn Concord Dawn into a 4/7 thanks to +3/+3
                expect(context.chewbacca).toBeAttachedTo(context.concordDawnInterceptors);
                expect(context.concordDawnInterceptors.getPower()).toBe(4);
                expect(context.concordDawnInterceptors.getHp()).toBe(7);
                expect(context.player1.readyResourceCount).toBe(p1Resources - 5);
                expect(context.chewbacca).toBeInZone('spaceArena');
            });

            it('it cannot be played as an upgrade on a friendly vehicle that already has a pilot', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jyn-erso#resisting-oppression',
                        hand: ['dagger-squadron-pilot'],
                        groundArena: ['wampa'],
                        spaceArena: [{ card: 'concord-dawn-interceptors', upgrades: ['academy-graduate'] }],
                    }
                });

                const { context } = contextRef;

                const p1Resources = context.player1.readyResourceCount;
                context.player1.clickCard(context.daggerSquadronPilot);
                expect(context.player1.readyResourceCount).toBe(p1Resources - 1);

                // Since Concord Dawn already has a Pilot, this should go straight to the ground
                expect(context.daggerSquadronPilot).toBeInZone('groundArena');
            });

            it('it cannot be played as an upgrade when there are no friendly vehicles', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jyn-erso#resisting-oppression',
                        hand: ['dagger-squadron-pilot']
                    }
                });

                const { context } = contextRef;

                const p1Resources = context.player1.readyResourceCount;
                context.player1.clickCard(context.daggerSquadronPilot);
                expect(context.player1.readyResourceCount).toBe(p1Resources - 1);
                expect(context.daggerSquadronPilot).toBeInZone('groundArena');
            });

            it('it cannot be played as an upgrade on an enemy vehicle', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jyn-erso#resisting-oppression',
                        hand: ['dagger-squadron-pilot'],
                    },
                    player2: {
                        spaceArena: ['concord-dawn-interceptors']
                    }
                });

                const { context } = contextRef;

                const p1Resources = context.player1.readyResourceCount;
                context.player1.clickCard(context.daggerSquadronPilot);
                expect(context.player1.readyResourceCount).toBe(p1Resources - 1);
                expect(context.daggerSquadronPilot).toBeInZone('groundArena');
            });

            it('and is unique, it will respect uniqueness if the first one in play is a attached as an upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'iden-versio#inferno-squad-commander',
                        hand: ['iden-versio#adapt-or-die'],
                        spaceArena: [{ card: 'concord-dawn-interceptors', upgrades: ['iden-versio#adapt-or-die'] }, 'restored-arc170'],
                    }
                });

                const { context } = contextRef;

                const p1Idens = context.player1.findCardsByName('iden-versio#adapt-or-die');
                context.idenInHand = p1Idens.find((iden) => iden.zoneName === 'hand');
                context.idenInPlay = p1Idens.find((iden) => iden.zoneName === 'spaceArena');

                const p1Resources = context.player1.readyResourceCount;
                context.player1.clickCard(context.idenInHand);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Play Iden Versio', 'Play Iden Versio with Piloting']);
                context.player1.clickPrompt('Play Iden Versio');
                expect(context.player1.readyResourceCount).toBe(p1Resources - 4);
                expect(context.player1).toHavePrompt('Choose which copy of Iden Versio, Adapt or Die to defeat');
                context.player1.clickCard(context.idenInHand);
                expect(context.idenInHand).toBeInZone('discard');
                expect(context.idenInPlay).toBeInZone('spaceArena');
            });

            it('and is unique, it will respect uniqueness if the first one in play is a unit and the new one is attached as an upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'iden-versio#inferno-squad-commander',
                        hand: ['iden-versio#adapt-or-die'],
                        groundArena: ['iden-versio#adapt-or-die'],
                        spaceArena: ['restored-arc170'],
                    }
                });

                const { context } = contextRef;

                const p1Idens = context.player1.findCardsByName('iden-versio#adapt-or-die');
                context.idenInHand = p1Idens.find((iden) => iden.zoneName === 'hand');
                context.idenInPlay = p1Idens.find((iden) => iden.zoneName === 'groundArena');

                const p1Resources = context.player1.readyResourceCount;
                context.player1.clickCard(context.idenInHand);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Play Iden Versio', 'Play Iden Versio with Piloting']);
                context.player1.clickPrompt('Play Iden Versio with Piloting');
                context.player1.clickCard(context.restoredArc170);
                expect(context.player1.readyResourceCount).toBe(p1Resources - 3);
                expect(context.idenInHand).toBeAttachedTo(context.restoredArc170);
                expect(context.player1).toHavePrompt('Choose which copy of Iden Versio, Adapt or Die to defeat');
                context.player1.clickCard(context.idenInPlay);
                expect(context.idenInPlay).toBeInZone('discard');
                expect(context.idenInHand).toBeInZone('spaceArena');
            });
        });

        describe('When a Pilot is attached to a friendly Vehicle', function () {
            it('it can be defeated like an upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#audacious-smuggler',
                        base: 'echo-base',
                        spaceArena: [{ card: 'concord-dawn-interceptors', upgrades: ['iden-versio#adapt-or-die', 'shield'] }, 'restored-arc170'],
                    },
                    player2: {
                        hand: ['confiscate']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.confiscate);
                expect(context.player2).toBeAbleToSelectExactly([context.idenVersio, context.shield]);
                context.player2.clickCard(context.idenVersio);
                expect(context.idenVersio).not.toBeAttachedTo(context.concordDawnInterceptors);
                expect(context.idenVersio).toBeInZone('discard');
            });

            it('it will be defeated if the attached card leaves play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#audacious-smuggler',
                        base: 'echo-base',
                        spaceArena: [{ card: 'concord-dawn-interceptors', upgrades: ['iden-versio#adapt-or-die', 'shield'] }, 'restored-arc170'],
                    },
                    player2: {
                        hand: ['waylay']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.waylay);
                expect(context.player2).toBeAbleToSelectExactly([context.concordDawnInterceptors, context.restoredArc170]);
                context.player2.clickCard(context.concordDawnInterceptors);
                expect(context.concordDawnInterceptors).toBeInZone('hand');
                expect(context.idenVersio).toBeInZone('discard');
            });

            it('can be moved to another vehicle with a Pilot ignoring the limit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [
                            { card: 'concord-dawn-interceptors', upgrades: ['iden-versio#adapt-or-die', 'shield'] },
                            { card: 'survivors-gauntlet', upgrades: ['bb8#happy-beeps'] },
                        ],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.survivorsGauntlet);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.idenVersio, context.bb8, context.shield]);
                expect(context.concordDawnInterceptors).toHaveExactUpgradeNames(['iden-versio#adapt-or-die', 'shield']);
                expect(context.survivorsGauntlet).toHaveExactUpgradeNames(['bb8#happy-beeps']);

                context.player1.clickCard(context.idenVersio);
                context.player1.clickCard(context.survivorsGauntlet);

                expect(context.concordDawnInterceptors).toHaveExactUpgradeNames(['shield']);
                expect(context.survivorsGauntlet).toHaveExactUpgradeNames(['bb8#happy-beeps', 'iden-versio#adapt-or-die', 'shield']);
            });
        });

        it('A unit with Piloting should not be able to be played as a pilot when played from Smuggle', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'han-solo#audacious-smuggler',
                    base: 'echo-base',
                    groundArena: ['tech#source-of-insight'],
                    spaceArena: ['cartel-turncoat'],
                    resources: ['dagger-squadron-pilot', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa']
                }
            });

            const { context } = contextRef;

            // check that the gained smuggle is used since it's the lower cost
            context.player1.clickCard(context.daggerSquadronPilot);
            expect(context.daggerSquadronPilot).toBeInZone('groundArena');
            expect(context.player1.exhaustedResourceCount).toBe(3);
        });

        it('A unit with Piloting should not be able to be played as a pilot when played with Sneak Attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'gar-saxon#viceroy-of-mandalore',
                    base: 'coronet-city',
                    hand: ['sneak-attack', 'iden-versio#adapt-or-die', 'wampa'],
                    spaceArena: ['cartel-turncoat'],
                }
            });

            const { context } = contextRef;

            // check that sneak attack doesn't allow user to play card as pilot upgrade
            context.player1.clickCard(context.sneakAttack);
            expect(context.player1).toBeAbleToSelectExactly([context.idenVersio, context.wampa]);
            context.player1.clickCard(context.idenVersio);
            expect(context.idenVersio).toBeInZone('groundArena');
            expect(context.player1.exhaustedResourceCount).toBe(3); // +2 for sneak attack and +1 for iden (3pt discount)
        });
    });
});
