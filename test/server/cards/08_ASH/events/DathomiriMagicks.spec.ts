describe('Dathomiri Magicks', function () {
    integration(function (contextRef) {
        describe('Dathomiri Magicks\' ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dathomiri-magicks'],
                        discard: [
                            'battlefield-marine',      // eligible: non-Vehicle unit, cost 2
                            'vanguard-infantry',       // eligible: non-Vehicle unit, cost 1
                            'death-star-stormtrooper', // eligible: non-Vehicle unit, cost 1
                            'specforce-soldier',       // eligible: non-Vehicle unit, cost 1
                            'wampa',                   // ineligible: unit costs 4 (> 2)
                            'tieln-fighter',           // ineligible: Vehicle unit
                            'daring-raid'              // ineligible: not a unit
                        ],
                        resources: 10,
                        base: 'command-center',
                        leader: 'grand-moff-tarkin#oversector-governor'
                    },
                    player2: {
                        hand: ['waylay']
                    }
                });
            });

            it('should play up to 3 non-Vehicle units that each cost 2 or less from the discard pile for free', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.dathomiriMagicks);

                expect(context.player1).toHavePrompt('Choose up to 3 units to play for free');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.vanguardInfantry,
                    context.deathStarStormtrooper,
                    context.specforceSoldier
                ]);
                expect(context.player1).toHaveEnabledPromptButtons(['Choose nothing', 'Cancel']);

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.vanguardInfantry);
                context.player1.clickCard(context.deathStarStormtrooper);
                context.player1.clickDone();

                // the three selected units are played for free into the ground arena
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
                expect(context.vanguardInfantry).toBeInZone('groundArena', context.player1);
                expect(context.deathStarStormtrooper).toBeInZone('groundArena', context.player1);

                // unselected / ineligible cards stay in the discard pile
                expect(context.specforceSoldier).toBeInZone('discard', context.player1);
                expect(context.wampa).toBeInZone('discard', context.player1);
                expect(context.tielnFighter).toBeInZone('discard', context.player1);
                expect(context.daringRaid).toBeInZone('discard', context.player1);

                // only the event's own cost (6) was paid; the units were free
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow choosing fewer than 3 units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.dathomiriMagicks);
                context.player1.clickCard(context.vanguardInfantry);
                context.player1.clickDone();

                expect(context.vanguardInfantry).toBeInZone('groundArena', context.player1);
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
                expect(context.deathStarStormtrooper).toBeInZone('discard', context.player1);
                expect(context.specforceSoldier).toBeInZone('discard', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow choosing no units and still resolve the event', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.dathomiriMagicks);
                context.player1.clickPrompt('Choose nothing');

                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
                expect(context.vanguardInfantry).toBeInZone('discard', context.player1);
                expect(context.deathStarStormtrooper).toBeInZone('discard', context.player1);
                expect(context.dathomiriMagicks).toBeInZone('discard', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Dathomiri Magicks\' cost reduction', function () {
            it('should cost 1 less when you control a Force unit', function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dathomiri-magicks'],
                        groundArena: ['yoda#old-master'], // Force unit
                        discard: ['battlefield-marine', 'vanguard-infantry'],
                        resources: 10,
                        base: 'command-center',
                        leader: 'grand-moff-tarkin#oversector-governor'
                    },
                    player2: {
                        hand: ['waylay']
                    }
                }).then(() => {
                    const { context } = contextRef;

                    context.player1.clickCard(context.dathomiriMagicks);
                    context.player1.clickCard(context.battlefieldMarine);
                    context.player1.clickDone();

                    expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
                    // event costs 6 - 1 = 5 (Force unit in play), unit played for free
                    expect(context.player1.exhaustedResourceCount).toBe(5);
                    expect(context.player2).toBeActivePlayer();
                });
            });

            it('should cost full price when you do not control a Force unit', function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dathomiri-magicks'],
                        groundArena: ['battlefield-marine'], // not a Force unit
                        discard: ['vanguard-infantry'],
                        resources: 10,
                        base: 'command-center',
                        leader: 'morgan-elsbeth#following-the-call'
                    },
                    player2: {
                        hand: ['waylay']
                    }
                }).then(() => {
                    const { context } = contextRef;

                    context.player1.clickCard(context.dathomiriMagicks);
                    context.player1.clickCard(context.vanguardInfantry);
                    context.player1.clickDone();

                    expect(context.vanguardInfantry).toBeInZone('groundArena', context.player1);
                    // event costs the full 6, unit played for free
                    expect(context.player1.exhaustedResourceCount).toBe(6);
                    expect(context.player2).toBeActivePlayer();
                });
            });
        });
    });
});
