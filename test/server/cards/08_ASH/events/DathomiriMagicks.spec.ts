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

            it('should play up to 3 non-Vehicle units that each cost 2 or less from the discard pile for free, one at a time', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.dathomiriMagicks);

                expect(context.player1).toHavePrompt('Choose a unit to play for free');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.vanguardInfantry,
                    context.deathStarStormtrooper,
                    context.specforceSoldier
                ]);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);

                // after the first play, the player is prompted again for the second card
                context.player1.clickCard(context.vanguardInfantry);
                expect(context.vanguardInfantry).toBeInZone('groundArena', context.player1);

                context.player1.clickCard(context.deathStarStormtrooper);
                expect(context.deathStarStormtrooper).toBeInZone('groundArena', context.player1);

                // having played the maximum of 3, the event resolves without another prompt
                expect(context.specforceSoldier).toBeInZone('discard', context.player1);
                expect(context.wampa).toBeInZone('discard', context.player1);
                expect(context.tielnFighter).toBeInZone('discard', context.player1);
                expect(context.daringRaid).toBeInZone('discard', context.player1);

                // only the event's own cost (6) was paid; the units were free
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });

            it('should let the player play fewer than 3 units and stop early', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.dathomiriMagicks);
                context.player1.clickCard(context.vanguardInfantry);
                expect(context.vanguardInfantry).toBeInZone('groundArena', context.player1);

                // the player is prompted for another card but chooses to stop
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.deathStarStormtrooper,
                    context.specforceSoldier
                ]);
                context.player1.clickPrompt('Choose nothing');

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

        describe('Dathomiri Magicks\' one-at-a-time resolution', function () {
            it('makes a unit defeated by an earlier play available to play from the discard pile', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dathomiri-magicks'],
                        // fragile friendly unit that will be defeated by Ruthless Assassin's When Played ability
                        groundArena: ['death-star-stormtrooper'], // 3/1, cost 1
                        discard: ['ruthless-assassin'],           // 3/3, cost 2, "When Played: Deal 2 damage to a friendly unit"
                        resources: 10,
                        base: 'command-center',
                        leader: 'grand-moff-tarkin#oversector-governor'
                    },
                    player2: {
                        hand: ['waylay']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.dathomiriMagicks);

                // only Ruthless Assassin is in the discard pile to start
                expect(context.player1).toBeAbleToSelectExactly([context.ruthlessAssassin]);
                context.player1.clickCard(context.ruthlessAssassin);

                // Ruthless Assassin's "When Played: Deal 2 damage to a friendly unit" resolves; defeat the Stormtrooper
                context.player1.clickCard(context.deathStarStormtrooper);
                expect(context.ruthlessAssassin).toBeInZone('groundArena', context.player1);
                expect(context.deathStarStormtrooper).toBeInZone('discard', context.player1);

                // the newly-defeated Stormtrooper is now available to play for the next modified play-a-card action
                expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper]);
                context.player1.clickCard(context.deathStarStormtrooper);
                expect(context.deathStarStormtrooper).toBeInZone('groundArena', context.player1);

                // both units were played for free; only the event cost (6) was paid
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Dathomiri Magicks\' cost reduction', function () {
            it('should cost 1 less when you control a Force unit', async function () {
                await contextRef.setupTestAsync({
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
                });

                const { context } = contextRef;

                context.player1.clickCard(context.dathomiriMagicks);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt('Choose nothing');

                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
                // event costs 6 - 1 = 5 (Force unit in play), unit played for free
                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });

            it('should cost full price when you do not control a Force unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dathomiri-magicks'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['heightened-awareness'] }], // not a Force unit
                        discard: ['vanguard-infantry'],
                        resources: 10,
                        base: 'command-center',
                        leader: 'morgan-elsbeth#following-the-call'
                    },
                    player2: {
                        hand: ['waylay']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.dathomiriMagicks);
                context.player1.clickCard(context.vanguardInfantry);

                expect(context.vanguardInfantry).toBeInZone('groundArena', context.player1);
                // event costs the full 6, unit played for free
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
