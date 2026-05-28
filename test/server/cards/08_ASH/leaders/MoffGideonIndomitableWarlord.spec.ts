describe('Moff Gideon, Indomitable Warlord', function () {
    integration(function (contextRef) {
        describe('leader side ability', function () {
            it('should allow paying 1 resource to draw a card when claiming initiative', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['warzone-lieutenant'],
                        leader: 'moff-gideon#indomitable-warlord',
                        resources: 4,
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.moffGideon);
                expect(context.player1).toHavePrompt('The ability "Play a unit from your hand. It costs 1 resource less." will have no effect. Are you sure you want to use it?');
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.moffGideon.exhausted).toBeTrue();
            });

            it('should allow paying 1 resource to draw a card when claiming initiative', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['warzone-lieutenant', 'academy-training', 'clone-pilot', 'resupply'],
                        leader: 'moff-gideon#indomitable-warlord',
                        spaceArena: ['tie-advanced', 'awing'],
                        resources: 4,
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['takedown']
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.tieAdvanced);

                context.player1.clickCard(context.moffGideon);

                expect(context.player1).toBeAbleToSelectExactly([context.warzoneLieutenant, context.clonePilot]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickCard(context.clonePilot);

                expect(context.player2).toBeActivePlayer();
                expect(context.moffGideon.exhausted).toBeTrue();
                expect(context.clonePilot).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });
        });

        describe('leader unit side ability', function () {
            it('should allow paying 1 resource to draw a card when claiming initiative', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'moff-gideon#indomitable-warlord',
                        discard: ['agent-kallus#seeking-the-rebels']
                    },
                    player2: {
                        groundArena: ['wampa', 'yoda#old-master']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.moffGideon);
                context.player1.clickPrompt('Deploy Moff Gideon');

                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeInZone('discard');
            });

            it('should allow paying 1 resource to draw a card when claiming initiative', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'moff-gideon#indomitable-warlord',
                        discard: ['devastator#inescapable']
                    },
                    player2: {
                        groundArena: ['wampa', 'yoda#old-master']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.moffGideon);
                context.player1.clickPrompt('Deploy Moff Gideon');

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.moffGideon]);

                context.player2.clickCard(context.moffGideon);
            });

            it('should allow paying 1 resource to draw a card when claiming initiative', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'moff-gideon#indomitable-warlord',
                        discard: ['chimaera#flagship-of-the-seventh-fleet']
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.moffGideon);
                context.player1.clickPrompt('Deploy Moff Gideon');

                expect(context.player2).toBeActivePlayer();
                expect(context.moffGideon).toHaveExactUpgradeNames(['shield']);
            });

            it('should allow paying 1 resource to draw a card when claiming initiative', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'moff-gideon#indomitable-warlord', deployed: true, damage: 2 },
                        discard: ['occupier-siege-tank']
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.moffGideon);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(7);
            });

            it('should allow paying 1 resource to draw a card when claiming initiative', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'moff-gideon#indomitable-warlord',
                        discard: ['grand-inquisitor#youre-right-to-be-afraid']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.moffGideon);
                context.player1.clickPrompt('Deploy Moff Gideon');

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });

            it('should allow paying 1 resource to draw a card when claiming initiative', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'moff-gideon#indomitable-warlord', deployed: true },
                        discard: ['atst']
                    },
                    player2: {
                        groundArena: ['lepi-lookout']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.moffGideon);
                context.player1.clickCard(context.lepiLookout);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(4);
            });

            it('should allow paying 1 resource to draw a card when claiming initiative', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'moff-gideon#indomitable-warlord', deployed: true },
                        discard: ['seventh-sister#implacable-inquisitor']
                    },
                    player2: {
                        groundArena: ['echo-base-defender']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.moffGideon);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.echoBaseDefender]);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow paying 1 resource to draw a card when claiming initiative', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'moff-gideon#indomitable-warlord',
                        groundArena: ['wampa'],
                        discard: ['rukh#from-the-shadows']
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.moffGideon);
                context.player1.clickPrompt('Deploy Moff Gideon');

                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(4);
            });

            it('should allow paying 1 resource to draw a card when claiming initiative', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'moff-gideon#indomitable-warlord',
                        groundArena: ['wampa'],
                        discard: ['lurking-tie-phantom', 'magistrates-scout', 'iden-versio#adapt-or-die'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.moffGideon);
                expect(context.player1).toHaveExactPromptButtons(['Deploy Moff Gideon', '(No effect) Play a unit from your hand. It costs 1 resource less.', 'Cancel']);
                context.player1.clickPrompt('Deploy Moff Gideon');

                context.player2.passAction();

                context.player1.clickCard(context.moffGideon);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(5);
                expect(context.p2Base.damage).toBe(5);
            });
        });
    });
});
