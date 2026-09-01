describe('Jar Jar Binks, Bombad General', function () {
    integration(function (contextRef) {
        describe('Jar Jar\'s leader undeployed ability', function () {
            it('does nothing if token upgrades were created this phase by opponent', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jar-jar-binks#bombad-general',
                        resources: 3,
                        base: { card: 'capital-city', damage: 2 },
                    },
                    player2: {
                        hand: ['clan-wren-rescuer'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                context.player2.clickCard(context.clanWrenRescuer);
                context.player2.clickCard(context.clanWrenRescuer);

                context.player1.clickCard(context.jarJarBinks);
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.jarJarBinks.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.p1Base.damage).toBe(2);
                expect(context.clanWrenRescuer.damage).toBe(0);
            });

            it('does nothing if token upgrades were created this phase by opponent (giving to our units)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jar-jar-binks#bombad-general',
                        resources: 3,
                        groundArena: ['wampa'],
                        base: { card: 'nightsister-lair', damage: 2 },
                    },
                    player2: {
                        groundArena: ['clone-x-assassin', 'atst'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                context.player2.clickCard(context.cloneXAssassin);
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.wampa);

                context.player1.clickCard(context.jarJarBinks);
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.damage).toBe(1);
                expect(context.p1Base.damage).toBe(2);
                expect(context.jarJarBinks.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('does nothing if token units were created this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jar-jar-binks#bombad-general',
                        hand: ['captain-rex#lead-by-example'],
                        base: { card: 'echo-base', damage: 2 },
                    },
                    player2: {
                        groundArena: ['wampa'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.captainRex);

                context.player2.passAction();

                context.player1.clickCard(context.jarJarBinks);
                context.player1.clickPrompt('(No effect) Deal 1 damage to a unit and heal 1 damage from a base');
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.damage).toBe(0);
                expect(context.p1Base.damage).toBe(2);
                expect(context.jarJarBinks.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(7);
            });

            it('does nothing if Force token were created this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jar-jar-binks#bombad-general',
                        resources: 3,
                        groundArena: ['gungi#finding-himself'],
                        base: { card: 'nightsister-lair', damage: 2 },
                    },
                    player2: {
                        groundArena: ['wampa'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.gungi);
                context.player1.clickCard(context.p2Base);

                expect(context.player1.hasTheForce).toBeTrue();
                context.player2.passAction();

                context.player1.clickCard(context.jarJarBinks);
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.damage).toBe(0);
                expect(context.p1Base.damage).toBe(2);
                expect(context.jarJarBinks.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('deals 1 damage to a unit and heals 1 damage from a base if a token upgrade was created this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jar-jar-binks#bombad-general',
                        resources: 3,
                        groundArena: ['han-solo#hibernation-sick'],
                        base: { card: 'capital-city', damage: 2 },
                    },
                    player2: {
                        groundArena: ['wampa'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hanSolo);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.jarJarBinks);
                expect(context.player1).toHavePrompt('Deal 1 damage to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.hanSolo, context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePrompt('Heal 1 damage from a base');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p1Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.damage).toBe(1);
                expect(context.p1Base.damage).toBe(1);
                expect(context.jarJarBinks.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('deals 1 damage to a unit and heals 1 damage from a base if a token upgrade was created this phase (giving to opponent\'s units)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jar-jar-binks#bombad-general',
                        resources: 3,
                        groundArena: ['clone-x-assassin'],
                        base: { card: 'capital-city', damage: 2 },
                    },
                    player2: {
                        groundArena: ['wampa'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.cloneXAssassin);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.wampa);

                context.player2.passAction();

                context.player1.clickCard(context.jarJarBinks);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p1Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.damage).toBe(2);
                expect(context.p1Base.damage).toBe(1);
                expect(context.jarJarBinks.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            xit('deals 1 damage to a unit and heals 1 damage from a base if a token upgrade was created this phase (our opponent make us create token upgrades)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jar-jar-binks#bombad-general',
                        resources: 3,
                        groundArena: ['gungi#finding-himself'],
                        base: { card: 'nightsister-lair', damage: 2 },
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hasInitiative: true,
                        leader: 'sabine-wren#bargaining-on-belief'
                    },
                });

                const { context } = contextRef;

                context.player2.clickCard(context.sabineWren);
                context.player2.clickPrompt('An opponent gives 2 Advantage tokens to a unit they control. If they do, the next unit you play this phase gains Shielded for this phase');
                context.player1.clickCard(context.gungi);

                context.player1.clickCard(context.jarJarBinks);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p1Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.damage).toBe(2);
                expect(context.p1Base.damage).toBe(1);
                expect(context.jarJarBinks.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });
        });

        describe('Jar Jar\'s leader deployed ability', function () {
            it('does nothing if token upgrades were created this phase by opponent', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jar-jar-binks#bombad-general', deployed: true },
                        base: { card: 'capital-city', damage: 2 },
                    },
                    player2: {
                        hand: ['clan-wren-rescuer'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                context.player2.clickCard(context.clanWrenRescuer);
                context.player2.clickCard(context.clanWrenRescuer);

                context.player1.clickCard(context.jarJarBinks);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(2);
                expect(context.clanWrenRescuer.damage).toBe(0);
            });

            it('does nothing if token upgrades were created this phase by opponent (giving to our units)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jar-jar-binks#bombad-general', deployed: true },
                        groundArena: ['wampa'],
                        base: { card: 'nightsister-lair', damage: 2 },
                    },
                    player2: {
                        groundArena: ['clone-x-assassin', 'atst'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                context.player2.clickCard(context.cloneXAssassin);
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.wampa);

                context.player1.clickCard(context.jarJarBinks);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.damage).toBe(1);
                expect(context.p1Base.damage).toBe(2);
            });

            it('does nothing if token units were created this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jar-jar-binks#bombad-general', deployed: true },
                        hand: ['captain-rex#lead-by-example'],
                        base: { card: 'echo-base', damage: 2 },
                    },
                    player2: {
                        groundArena: ['wampa'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.captainRex);

                context.player2.passAction();

                context.player1.clickCard(context.jarJarBinks);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.damage).toBe(0);
                expect(context.p1Base.damage).toBe(2);
            });

            it('does nothing if Force token were created this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jar-jar-binks#bombad-general', deployed: true },
                        groundArena: ['gungi#finding-himself'],
                        base: { card: 'nightsister-lair', damage: 2 },
                    },
                    player2: {
                        groundArena: ['wampa'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.gungi);
                context.player1.clickCard(context.p2Base);

                expect(context.player1.hasTheForce).toBeTrue();
                context.player2.passAction();

                context.player1.clickCard(context.jarJarBinks);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.damage).toBe(0);
                expect(context.p1Base.damage).toBe(2);
            });

            it('deals 1 damage to a unit and heals 1 damage from a base if a token upgrade was created this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jar-jar-binks#bombad-general', deployed: true },
                        groundArena: ['han-solo#hibernation-sick'],
                        base: { card: 'capital-city', damage: 2 },
                    },
                    player2: {
                        groundArena: ['wampa'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hanSolo);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.jarJarBinks);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt('Deal 1 damage to a unit and heal 1 damage from a base');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Deal 1 damage to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.hanSolo, context.wampa, context.jarJarBinks]);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePrompt('Heal 1 damage from a base');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p1Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.damage).toBe(1);
                expect(context.p1Base.damage).toBe(1);
            });

            it('deals 1 damage to a unit and heals 1 damage from a base if a token upgrade was created this phase (giving to opponent\'s units)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jar-jar-binks#bombad-general', deployed: true },
                        groundArena: ['clone-x-assassin'],
                        base: { card: 'capital-city', damage: 2 },
                    },
                    player2: {
                        groundArena: ['wampa'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.cloneXAssassin);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.wampa);

                context.player2.passAction();

                context.player1.clickCard(context.jarJarBinks);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt('Deal 1 damage to a unit and heal 1 damage from a base');
                context.player1.clickPrompt('Trigger');

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p1Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.damage).toBe(2);
                expect(context.p1Base.damage).toBe(1);
            });

            xit('deals 1 damage to a unit and heals 1 damage from a base if a token upgrade was created this phase (our opponent make us create token upgrades)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'jar-jar-binks#bombad-general', deployed: true },
                        groundArena: ['gungi#finding-himself'],
                        base: { card: 'nightsister-lair', damage: 2 },
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hasInitiative: true,
                        leader: 'sabine-wren#bargaining-on-belief'
                    },
                });

                const { context } = contextRef;

                context.player2.clickCard(context.sabineWren);
                context.player2.clickPrompt('An opponent gives 2 Advantage tokens to a unit they control. If they do, the next unit you play this phase gains Shielded for this phase');
                context.player1.clickCard(context.gungi);

                context.player1.clickCard(context.jarJarBinks);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt('Deal 1 damage to a unit and heal 1 damage from a base');
                context.player1.clickPrompt('Trigger');

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p1Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.damage).toBe(2);
                expect(context.p1Base.damage).toBe(1);
            });
        });
    });
});
