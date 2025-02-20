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
                expect(context.concordDawnInterceptors.upgrades).toContain(context.daggerSquadronPilot);
                expect(context.concordDawnInterceptors.getPower()).toBe(3);
                expect(context.concordDawnInterceptors.getHp()).toBe(5);
                expect(context.player1.readyResourceCount).toBe(p1Resources - 1);
                expect(context.daggerSquadronPilot).toBeInZone('spaceArena');
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
                expect(context.restoredArc170.upgrades).toContain(context.idenInHand);
                expect(context.player1).toHavePrompt('Choose which copy of Iden Versio, Adapt or Die to defeat');
                context.player1.clickCard(context.idenInPlay);
                expect(context.idenInPlay).toBeInZone('discard');
                expect(context.idenInHand).toBeInZone('spaceArena');
            });
        });
    });
});
