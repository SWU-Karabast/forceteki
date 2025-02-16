describe('Capture system', function() {
    integration(function (contextRef) {
        describe('When a unit is captured', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['discerning-veteran']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hand: ['vanquish', 'waylay']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                // capture Wampa with Discerning Veteran
                context.player1.clickCard(context.discerningVeteran);
            });

            it('it should be in the captor\'s capture zone', function () {
                const { context } = contextRef;

                expect(context.wampa).toBeCapturedBy(context.discerningVeteran);
            });

            it('and the captor is defeated, it should return to its owner\'s arena exhausted', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.vanquish);
                expect(context.discerningVeteran).toBeInZone('discard');
                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(context.wampa.exhausted).toBeTrue();
            });

            it('and the captor is returned to hand, it should return to its owner\'s arena exhausted', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.waylay);
                expect(context.discerningVeteran).toBeInZone('hand');
                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(context.wampa.exhausted).toBeTrue();
            });
        });

        it('When multiple units are captured, they should all be in the capture zone and all rescued on capture defeat', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['discerning-veteran', 'legal-authority'],
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['green-squadron-awing'],
                    hand: ['vanquish']
                },

                // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                autoSingleTarget: true
            });

            const { context } = contextRef;

            // capture Wampa with Discerning Veteran
            context.player1.clickCard(context.discerningVeteran);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeCapturedBy(context.discerningVeteran);

            context.player2.passAction();

            // capture AT-ST with Discerning Veteran
            context.player1.clickCard(context.legalAuthority);
            // discerning veteran and green squadron awing were chosen automatically
            expect(context.greenSquadronAwing).toBeCapturedBy(context.discerningVeteran);
            expect(context.wampa).toBeCapturedBy(context.discerningVeteran);

            // defeat Discerning Veteran, both units rescued
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.discerningVeteran);
            expect(context.atst).toBeInZone('groundArena');
            expect(context.wampa).toBeInZone('groundArena');
            expect(context.greenSquadronAwing).toBeInZone('spaceArena');
            expect(context.atst.exhausted).toBeFalse();
            expect(context.wampa.exhausted).toBeTrue();
            expect(context.greenSquadronAwing.exhausted).toBeTrue();
        });

        it('When a unit with captives is taken control of and defeated, the captives should return to their owner\'s control', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['take-captive'],
                    leader: { card: 'emperor-palpatine#galactic-ruler', exhausted: true },
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa'],
                    hand: ['discerning-veteran', 'vanquish'],
                    leader: { card: 'han-solo#worth-the-risk', deployed: true, exhausted: true },
                },

                // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                autoSingleTarget: true
            });

            const { context } = contextRef;

            context.player1.passAction();

            // use Han Solo to play Discerning Veteran which captures Battlefield Marine
            context.player2.clickCard(context.hanSolo);
            context.player2.clickPrompt('Play a unit from your hand. It costs 1 resource less. Deal 2 damage to it. -> Discerning Veteran');
            expect(context.battlefieldMarine).toBeCapturedBy(context.discerningVeteran);

            // player 1 flip Palpatine to take control of Discerning Veteran and confirm all state
            context.player1.clickCard(context.emperorPalpatine);
            expect(context.discerningVeteran.capturedUnits.length).toBe(1);
            expect(context.discerningVeteran.capturedUnits[0]).toBe(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeCapturedBy(context.discerningVeteran);

            context.player2.passAction();

            // capture player 2's Wampa with controlled Discerning Veteran
            context.player1.clickCard(context.takeCaptive);
            context.player1.clickCard(context.discerningVeteran);
            expect(context.wampa).toBeCapturedBy(context.discerningVeteran);

            // defeat Discerning Veteran, both units rescued and returned to their owner's arena
            context.player2.clickCard(context.vanquish);
            expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
            expect(context.wampa).toBeInZone('groundArena', context.player2);
            expect(context.battlefieldMarine.exhausted).toBeTrue();
            expect(context.wampa.exhausted).toBeTrue();
        });

        it('When a unit is captured that has upgrades and its own captured unit, the upgrades are defeated and the unit is rescued', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['discerning-veteran'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: [{ card: 'wampa', upgrades: ['academy-training'] }],
                    hand: ['take-captive']
                },

                // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                autoSingleTarget: true
            });

            const { context } = contextRef;

            context.player1.passAction();

            // capture marine with wampa
            context.player2.clickCard(context.takeCaptive);

            // capture wampa with discerning veteran
            context.player1.clickCard(context.discerningVeteran);

            expect(context.wampa).toBeCapturedBy(context.discerningVeteran);
            expect(context.battlefieldMarine).toBeInZone('groundArena');
            expect(context.battlefieldMarine.exhausted).toBeTrue();
            expect(context.academyTraining).toBeInZone('discard');
        });

        describe('When multiple units are guarding captured units', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['evacuate', 'superlaser-blast'],
                        spaceArena: [{ card: 'wing-leader', capturedUnits: ['tieln-fighter', { card: 'green-squadron-awing', owner: 'player1' }] }]
                    },
                    player2: {
                        groundArena: ['pyke-sentinel', { card: 'discerning-veteran', capturedUnits: ['wampa', 'atst', { card: 'death-trooper', owner: 'player2' }] }],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('and all units in the arena are returned to hand, all captured units are rescued', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.evacuate);

                // check captured units are rescued
                expect(context.wampa).toBeInZone('groundArena', context.player1);
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.atst).toBeInZone('groundArena', context.player1);
                expect(context.atst.exhausted).toBeTrue();
                expect(context.deathTrooper).toBeInZone('groundArena', context.player2);
                expect(context.deathTrooper.exhausted).toBeTrue();
                expect(context.tielnFighter).toBeInZone('spaceArena', context.player2);
                expect(context.tielnFighter.exhausted).toBeTrue();
                expect(context.greenSquadronAwing).toBeInZone('spaceArena', context.player1);
                expect(context.greenSquadronAwing.exhausted).toBeTrue();

                // check previous arena units are returned to hand
                expect(context.wingLeader).toBeInZone('hand');
                expect(context.pykeSentinel).toBeInZone('hand');
                expect(context.discerningVeteran).toBeInZone('hand');
            });

            it('and all units in the arena are defeated, all captured units are rescued', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.superlaserBlast);

                // check captured units are rescued
                expect(context.wampa).toBeInZone('groundArena', context.player1);
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.atst).toBeInZone('groundArena', context.player1);
                expect(context.atst.exhausted).toBeTrue();
                expect(context.deathTrooper).toBeInZone('groundArena', context.player2);
                expect(context.deathTrooper.exhausted).toBeTrue();
                expect(context.tielnFighter).toBeInZone('spaceArena', context.player2);
                expect(context.tielnFighter.exhausted).toBeTrue();
                expect(context.greenSquadronAwing).toBeInZone('spaceArena', context.player1);
                expect(context.greenSquadronAwing.exhausted).toBeTrue();

                // check previous arena units are returned to hand
                expect(context.wingLeader).toBeInZone('discard');
                expect(context.pykeSentinel).toBeInZone('discard');
                expect(context.discerningVeteran).toBeInZone('discard');
            });
        });
    });
});
