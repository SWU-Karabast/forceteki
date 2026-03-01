describe('Citadel Research Center', function () {
    integration(function (contextRef) {
        describe('Citadel Research Center\'s epic action ability', function () {
            it('will not be selectable if not enough ready resources', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'citadel-research-center',
                        leader: 'bail-organa#doing-everything-he-can',
                        hand: ['entrenched', 'r2d2#ignoring-protocol'],
                        resources: [
                            { card: 'cartel-spacer', exhausted: true },
                            { card: 'daring-raid', exhausted: true },
                            { card: 'surprise-strike', exhausted: true }
                        ],
                    },
                });

                const { context } = contextRef;

                expect(context.player1).not.toBeAbleToSelect(context.citadelResearchCenter);
                expect(context.player1).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('will allow Citadel Research Center to return a resource to hand and resource the top card of the deck one time', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'citadel-research-center',
                        leader: 'bail-organa#doing-everything-he-can',
                        deck: ['entrenched', 'r2d2#ignoring-protocol'],
                        groundArena: ['battlefield-marine'],
                        resources: ['wampa', 'moisture-farmer', 'pyke-sentinel'],
                    },
                    player2: {
                        hand: ['takedown']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.citadelResearchCenter);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.moistureFarmer, context.pykeSentinel]);
                context.player1.clickCard(context.moistureFarmer);
                expect(context.moistureFarmer).toBeInZone('hand');
                expect(context.player1.resources.length).toBe(3);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.entrenched).toBeInZone('resource');

                context.moveToNextActionPhase();

                expect(context.player1).not.toBeAbleToSelect(context.citadelResearchCenter);
            });

            it('will allow Citadel Research Center to return a resource to hand if the deck is empty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'citadel-research-center',
                        leader: 'bail-organa#doing-everything-he-can',
                        deck: [],
                        groundArena: ['battlefield-marine'],
                        resources: ['wampa', 'moisture-farmer', 'pyke-sentinel'],
                    },
                    player2: {
                        hand: ['takedown']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.citadelResearchCenter);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.moistureFarmer, context.pykeSentinel]);
                context.player1.clickCard(context.moistureFarmer);
                expect(context.moistureFarmer).toBeInZone('hand');
                expect(context.player1.resources.length).toBe(2);
                expect(context.player1.exhaustedResourceCount).toBe(0);
            });

            it('will allow Citadel Research Center to return a resource to hand and resource the top card of the deck one time', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'citadel-research-center',
                        leader: 'bail-organa#doing-everything-he-can',
                        deck: ['entrenched', 'r2d2#ignoring-protocol'],
                        hand: ['arquitens-assault-cruiser'],
                        groundArena: ['battlefield-marine'],
                        resources: ['wampa', 'moisture-farmer', 'pyke-sentinel', 'wampa', 'wampa', 'lurking-tie-phantom', 'lurking-tie-phantom', 'lurking-tie-phantom', 'surprise-strike'],
                    },
                    player2: {
                        spaceArena: ['cartel-spacer'],
                        hand: ['takedown']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.arquitensAssaultCruiser);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.cartelSpacer);

                context.player2.passAction();

                context.player1.clickCard(context.citadelResearchCenter);
                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer).toBeInZone('hand', context.player2);
                expect(context.player1.resources.length).toBe(10);
                expect(context.player1.exhaustedResourceCount).toBe(10);
                expect(context.entrenched).toBeInZone('resource');
            });
        });
    });
});