describe('General\'s Blade', function () {
    integration(function (contextRef) {
        it('General\'s Blade\'s ability should give a 2 cost reduction for the next unit we play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa', 'battlefield-marine', 'smugglers-aid', 'palpatines-return'],
                    groundArena: [{ card: 'obiwan-kenobi#following-fate', upgrades: ['generals-blade'] }],
                    base: 'echo-base',
                    leader: 'cassian-andor#dedicated-to-the-rebellion',
                    resources: ['atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'collections-starhopper'],
                    discard: ['krayt-dragon']
                },
                player2: {
                    hand: ['corporate-defense-shuttle'],
                }
            });

            const { context } = contextRef;

            // trigger general's blade ability
            context.player1.clickCard(context.obiwanKenobi);
            context.player1.clickCard(context.p2Base);
            context.player2.clickCard(context.corporateDefenseShuttle);
            expect(context.getChatLogs(2)).toContain('player1 uses Obi-Wan Kenobi\'s gained ability from General\'s Blade to discount the next unit played by them for this phase');

            // play an event with normal cost
            context.player1.clickCard(context.smugglersAid);
            expect(context.player1.exhaustedResourceCount).toBe(1);
            context.player2.passAction();

            // play wampa, he should cost 2 less
            context.player1.clickCard(context.wampa);
            expect(context.player1.exhaustedResourceCount).toBe(3);
            context.player2.passAction();

            // play battlefield marine with normal cost
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.exhaustedResourceCount).toBe(5);

            context.moveToNextActionPhase();

            // trigger general's blade ability
            context.player1.clickCard(context.obiwanKenobi);
            context.player1.clickCard(context.p2Base);
            context.player2.passAction();

            // play a unit from smuggle, should cost 2 resources less
            context.player1.clickCard(context.collectionsStarhopper);
            expect(context.player1.exhaustedResourceCount).toBe(1);

            context.moveToNextActionPhase();

            // trigger general's blade ability
            context.player1.clickCard(context.obiwanKenobi);
            context.player1.clickCard(context.p2Base);
            context.player2.passAction();

            // play a unit from discard with palpatine's return, should cost 2 resource less
            context.player1.clickCard(context.palpatinesReturn);
            context.player1.clickCard(context.kraytDragon);

            expect(context.player1.exhaustedResourceCount).toBe(9);// (6+2) from palpatine's return + 3-2=1 from krayt dragon
        });

        it('General\'s Blade\'s ability should give a 2 cost reduction for the next unit we play only for the phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa', 'battlefield-marine', 'smugglers-aid'],
                    groundArena: [{ card: 'obiwan-kenobi#following-fate', upgrades: ['generals-blade'] }],
                    base: 'echo-base',
                    leader: 'cassian-andor#dedicated-to-the-rebellion'
                },
            });

            const { context } = contextRef;

            // trigger general's blade ability
            context.player1.clickCard(context.obiwanKenobi);
            context.player1.clickCard(context.p2Base);
            context.player2.passAction();

            context.moveToNextActionPhase();

            // play an event with normal cost
            context.player1.clickCard(context.smugglersAid);
            expect(context.player1.exhaustedResourceCount).toBe(1);
            context.player2.passAction();

            // play wampa with normal cost
            context.player1.clickCard(context.wampa);
            expect(context.player1.exhaustedResourceCount).toBe(5);
            context.player2.passAction();

            // play battlefield marine with normal cost
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.exhaustedResourceCount).toBe(7);
        });

        it('General\'s Blade\'s ability should not provide a discount when playing a unit as a Pilot', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dagger-squadron-pilot'],
                    groundArena: [{ card: 'obiwan-kenobi#following-fate', upgrades: ['generals-blade'] }],
                    spaceArena: ['cartel-turncoat'],
                    base: 'echo-base',
                    leader: 'cassian-andor#dedicated-to-the-rebellion'
                },
            });

            const { context } = contextRef;

            // trigger general's blade ability
            context.player1.clickCard(context.obiwanKenobi);
            context.player1.clickCard(context.p2Base);
            context.player2.passAction();

            context.player1.clickCard(context.daggerSquadronPilot);
            context.player1.clickPrompt('Play Dagger Squadron Pilot with Piloting');
            context.player1.clickCard(context.cartelTurncoat);

            expect(context.player1.exhaustedResourceCount).toBe(3); // due to Aspect penalty
            expect(context.daggerSquadronPilot).toBeInZone('spaceArena');
            expect(context.daggerSquadronPilot).toBeAttachedTo(context.cartelTurncoat);
        });
    });
});
