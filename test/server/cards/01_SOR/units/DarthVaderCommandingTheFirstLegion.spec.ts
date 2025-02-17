describe('Darth Vader, Commanding the First Legion', function () {
    integration(function (contextRef) {
        describe('Darth Vader\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hondo-ohnaka#thats-good-business',
                        hand: ['darth-vader#commanding-the-first-legion'],
                        deck: [
                            'battlefield-marine',
                            'vanguard-infantry',
                            'scout-bike-pursuer',
                            'hunting-nexu',
                            'tieln-fighter',
                            'daring-raid',
                            'protector',
                            'isb-agent',
                            'death-star-stormtrooper',
                            'superlaser-technician',
                            'atst'
                        ],
                    }
                });
            });

            it('should search the top 10 cards and play units with total cost <= 3 for free', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.darthVader);

                context.player1.clickPrompt('Ambush');
                expect(context.player1).toHavePrompt('Choose any units with combined cost 3 or less to play for free');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.scoutBikePursuer, context.tielnFighter, context.isbAgent, context.deathStarStormtrooper, context.superlaserTechnician],
                    invalid: [context.vanguardInfantry, context.huntingNexu, context.daringRaid, context.protector, context.battlefieldMarine]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                // click on Superlaser Technician (cost 3) first and confirm that it makes everything else unselectable
                context.player1.clickCardInDisplayCardPrompt(context.superlaserTechnician);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.superlaserTechnician],
                    unselectable: [context.scoutBikePursuer, context.tielnFighter, context.isbAgent, context.deathStarStormtrooper],
                    invalid: [context.vanguardInfantry, context.huntingNexu, context.daringRaid, context.protector, context.battlefieldMarine],
                    usesSelectionOrder: true
                });
                expect(context.player1).toHaveEnabledPromptButton('Play cards in selection order');

                // click on Superlaser Technician again to unselect her and confirm that the prompt reverts to the initial state
                context.player1.clickCardInDisplayCardPrompt(context.superlaserTechnician);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.scoutBikePursuer, context.tielnFighter, context.isbAgent, context.deathStarStormtrooper, context.superlaserTechnician],
                    invalid: [context.vanguardInfantry, context.huntingNexu, context.daringRaid, context.protector, context.battlefieldMarine]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                // progressively select 3 units with combined cost 3
                context.player1.clickCardInDisplayCardPrompt(context.tielnFighter);
                context.player1.clickCardInDisplayCardPrompt(context.isbAgent);
                context.player1.clickCardInDisplayCardPrompt(context.deathStarStormtrooper);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.tielnFighter, context.isbAgent, context.deathStarStormtrooper],
                    unselectable: [context.scoutBikePursuer, context.superlaserTechnician],
                    invalid: [context.vanguardInfantry, context.huntingNexu, context.daringRaid, context.protector, context.battlefieldMarine],
                    usesSelectionOrder: true
                });
                expect(context.player1).toHaveEnabledPromptButton('Play cards in selection order');

                context.player1.clickPrompt('Play cards in selection order');
                expect([context.isbAgent, context.deathStarStormtrooper]).toAllBeInZone('groundArena');
                expect(context.tielnFighter).toBeInZone('spaceArena');
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect([context.scoutBikePursuer, context.superlaserTechnician, context.vanguardInfantry, context.huntingNexu, context.daringRaid, context.protector, context.battlefieldMarine])
                    .toAllBeInBottomOfDeck(context.player1, 7);
            });

            it('should allow the player to play only one card', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.darthVader);
                context.player1.clickPrompt('Ambush');

                expect(context.player1).toHavePrompt('Choose any units with combined cost 3 or less to play for free');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.scoutBikePursuer, context.tielnFighter, context.isbAgent, context.deathStarStormtrooper, context.superlaserTechnician],
                    invalid: [context.vanguardInfantry, context.huntingNexu, context.daringRaid, context.protector, context.battlefieldMarine]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.scoutBikePursuer);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.scoutBikePursuer],
                    unselectable: [context.superlaserTechnician],
                    selectable: [context.tielnFighter, context.isbAgent, context.deathStarStormtrooper],
                    invalid: [context.vanguardInfantry, context.huntingNexu, context.daringRaid, context.protector, context.battlefieldMarine],
                    usesSelectionOrder: true
                });
                expect(context.player1).toHaveEnabledPromptButton('Play cards in selection order');

                context.player1.clickPrompt('Play cards in selection order');
                expect(context.scoutBikePursuer).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect([context.superlaserTechnician, context.tielnFighter, context.isbAgent, context.deathStarStormtrooper, context.vanguardInfantry, context.huntingNexu, context.daringRaid, context.protector, context.battlefieldMarine])
                    .toAllBeInBottomOfDeck(context.player1, 9);
            });

            it('should allow the player to take nothing', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.darthVader);

                context.player1.clickPrompt('Ambush');
                expect(context.player1).toHavePrompt('Choose any units with combined cost 3 or less to play for free');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.scoutBikePursuer, context.tielnFighter, context.isbAgent, context.deathStarStormtrooper, context.superlaserTechnician],
                    invalid: [context.vanguardInfantry, context.huntingNexu, context.daringRaid, context.protector, context.battlefieldMarine]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickPrompt('Take nothing');
                expect([context.scoutBikePursuer, context.tielnFighter, context.isbAgent, context.deathStarStormtrooper, context.superlaserTechnician, context.vanguardInfantry, context.huntingNexu, context.daringRaid, context.protector, context.battlefieldMarine])
                    .toAllBeInBottomOfDeck(context.player1, 10);
            });
        });

        it('Darth Vader\'s ability should play each card as a nested action (triggered abilities happen immediately)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'hondo-ohnaka#thats-good-business',
                    hand: ['darth-vader#commanding-the-first-legion'],
                    deck: ['salacious-crumb#obnoxious-pet', 'outland-tie-vanguard', 'scout-bike-pursuer'],
                    base: { card: 'echo-base', damage: 5 }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthVader);

            context.player1.clickPrompt('Ambush');
            expect(context.player1).toHavePrompt('Choose any units with combined cost 3 or less to play for free');
            context.player1.clickCardInDisplayCardPrompt(context.salaciousCrumb);
            context.player1.clickCardInDisplayCardPrompt(context.outlandTieVanguard);
            context.player1.clickPrompt('Play cards in selection order');

            // Salacious Crumb ability triggers and heal 1 damage from base
            expect(context.p1Base.damage).toBe(4);

            // outland tie vanguard should give an experience token to a unit that costs 3 resources or less
            expect(context.player1).toBeAbleToSelectExactly([context.salaciousCrumb]);
            context.player1.clickCard(context.salaciousCrumb);
            expect(context.salaciousCrumb).toHaveExactUpgradeNames(['experience']);
        });

        it('Darth Vader\'s ability and another search card ability should show right cards', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'hondo-ohnaka#thats-good-business',
                    hand: ['darth-vader#commanding-the-first-legion'],
                    deck: [
                        'inferno-four#unforgetting',
                        'vanguard-infantry',
                        'scout-bike-pursuer',
                        'hunting-nexu',
                        'tieln-fighter',
                        'daring-raid',
                        'protector',
                        'isb-agent',
                        'death-star-stormtrooper',
                        'superlaser-technician',
                        'atst',
                        'wampa',
                        'consular-security-force',
                    ],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthVader);
            context.player1.clickPrompt('Ambush');
            expect(context.player1).toHavePrompt('Choose any units with combined cost 3 or less to play for free');

            // play inferno four
            context.player1.clickCardInDisplayCardPrompt(context.infernoFour);
            context.player1.clickCardInDisplayCardPrompt(context.tielnFighter);
            context.player1.clickPrompt('Play cards in selection order');

            // tie-ln fighter is not in deck (his zone is still 'deck' while he is not played but you can not draw it)
            expect(context.player1.deck).not.toContain(context.tielnFighter);

            // another cards revealed by Vader is in bottom of deck
            expect([context.scoutBikePursuer, context.superlaserTechnician, context.vanguardInfantry, context.huntingNexu, context.daringRaid, context.protector, context.isbAgent, context.deathStarStormtrooper])
                .toAllBeInBottomOfDeck(context.player1, 8);

            // inferno four's ability should show the next 2 cards
            expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.atst, context.wampa]);
            expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Put on top', 'Put on bottom']);
            context.player1.clickDisplayCardPromptButton(context.atst.uuid, 'top');
            context.player1.clickDisplayCardPromptButton(context.wampa.uuid, 'bottom');

            // atst should be on the top of deck
            expect(context.player1.deck[0]).toBe(context.atst);
            expect(context.player1.deck[1]).toBe(context.consularSecurityForce);

            // wampa should be the last card of deck
            expect(context.wampa).toBeInBottomOfDeck(context.player1, 1);
        });
    });
});
