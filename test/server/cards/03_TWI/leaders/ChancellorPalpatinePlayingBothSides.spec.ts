describe('Chancellor Palpatine, Playing Both Sides', function () {
    integration(function (contextRef) {
        describe('Chancellor Palpatine\'s leader ability', function () {
            it('can flip back and forth', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'chancellor-palpatine#playing-both-sides',
                        base: { card: 'echo-base', damage: 10 },
                        groundArena: ['battlefield-marine'],
                        hand: ['pyke-sentinel']
                    },
                    player2: {
                        hand: ['vanquish', 'takedown']
                    }
                });

                const { context } = contextRef;

                // Enable and trigger Heroism flip
                context.player1.passAction();
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.battlefieldMarine);

                // Check that Palpatine flipped correctly
                context.player1.clickCard(context.chancellorPalpatine);
                expect(context.chancellorPalpatine.exhausted).toBe(true);
                expect(context.p1Base.damage).toBe(8);
                expect(context.player1.hand.length).toBe(2);
                expect(context.chancellorPalpatine.onStartingSide).toBe(false);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.pykeSentinel);
                context.player2.passAction();

                // Check that Palpatine can flip back from Villainy to Heroism
                context.player1.clickCard(context.chancellorPalpatine);
                expect(context.chancellorPalpatine.onStartingSide).toBe(true);
                expect(context.chancellorPalpatine.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(2);
                const cloneTroopers = context.player1.findCardsByName('clone-trooper');
                expect(cloneTroopers.length).toBe(1);
                expect(cloneTroopers[0]).toBeInZone('groundArena');

                // Move to next phase and enable Palpatine hero flip
                context.moveToNextActionPhase();
                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(cloneTroopers[0]);

                // Check that Palpatine can flip to Villainy from Heroism
                context.player1.clickCard(context.chancellorPalpatine);
                expect(context.chancellorPalpatine.exhausted).toBe(true);
                expect(context.p1Base.damage).toBe(6);
                expect(context.player1.hand.length).toBe(6);
                expect(context.chancellorPalpatine.onStartingSide).toBe(false);
            });

            it('only exhausts and no other abilities trigger if no friendly Heroism unit has died', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'chancellor-palpatine#playing-both-sides',
                        base: { card: 'echo-base', damage: 10 },
                        groundArena: ['battlefield-marine', 'wampa']
                    },
                    player2: {
                        hand: ['takedown', 'waylay']
                    }
                });

                const { context } = contextRef;

                // Ensure no effect besides exhaustion
                context.player1.clickCard(context.chancellorPalpatine);
                expect(context.chancellorPalpatine.exhausted).toBe(true);
                expect(context.p1Base.damage).toBe(10);
                expect(context.player1.hand.length).toBe(0);

                context.moveToNextActionPhase();
                expect(context.player1.hand.length).toBe(2);
                context.player1.passAction();

                // Ensure that a friendly Heroism card returning to hand doesn't trigger the ability
                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.battlefieldMarine);

                // Ensure no effect besides exhaustion
                context.player1.clickCard(context.chancellorPalpatine);
                expect(context.chancellorPalpatine.exhausted).toBe(true);
                expect(context.p1Base.damage).toBe(10);

                context.moveToNextActionPhase();
                expect(context.player1.hand.length).toBe(5);
                context.player1.passAction();

                // Ensure that a friendly non-Heroism card being defeated doesn't trigger the ability
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.wampa);

                // Ensure no effect besides exhaustion
                context.player1.clickCard(context.chancellorPalpatine);
                expect(context.chancellorPalpatine.exhausted).toBe(true);
                expect(context.p1Base.damage).toBe(10);
                expect(context.player1.hand.length).toBe(5);
            });

            it('draws, heals, and flips if a friendly Heroism unit has died', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'chancellor-palpatine#playing-both-sides',
                        base: { card: 'echo-base', damage: 10 },
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: ['takedown']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.battlefieldMarine);

                // Check that Palpatine healed, drew, and flipped
                context.player1.clickCard(context.chancellorPalpatine);
                expect(context.chancellorPalpatine.exhausted).toBe(true);
                expect(context.p1Base.damage).toBe(8);
                expect(context.player1.hand.length).toBe(1);
                expect(context.chancellorPalpatine.onStartingSide).toBe(false);
            });

            it('does not trigger a base with a \'When you deploy your leader\' ability', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'chancellor-palpatine#playing-both-sides',
                        base: { card: 'droid-manufactory', damage: 10 },
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: ['takedown']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.battlefieldMarine);

                // Check that Palpatine healed, drew, and flipped
                context.player1.clickCard(context.chancellorPalpatine);
                expect(context.chancellorPalpatine.exhausted).toBe(true);
                expect(context.p1Base.damage).toBe(8);
                expect(context.player1.hand.length).toBe(1);
                expect(context.chancellorPalpatine.onStartingSide).toBe(false);

                // Check that no Droids were created
                expect(context.player1.findCardsByName('battle-droid').length).toBe(0);
            });
        });

        describe('Chancellor Palpatine\'s leader ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'chancellor-palpatine#playing-both-sides', flipped: true },
                        base: { card: 'echo-base', damage: 10 },
                        groundArena: ['battlefield-marine'],
                        hand: ['pyke-sentinel']
                    },
                    player2: {
                        hand: ['vanquish', 'takedown', 'waylay', 'power-of-the-dark-side']
                    }
                });
            });

            it('back-side does nothing if no Villainy card was played', function () {
                const { context } = contextRef;
                expect(context.chancellorPalpatine.onStartingSide).toBe(false);
                context.player1.clickCard(context.chancellorPalpatine);
                expect(context.chancellorPalpatine.exhausted).toBe(true);
            });

            it('back-side is not enabled by opponent playing a Villainy card nor by a friendly Heroism unit dying', function () {
                const { context } = contextRef;
                expect(context.chancellorPalpatine.onStartingSide).toBe(false);

                context.player1.passAction();
                context.player2.clickCard(context.powerOfTheDarkSide);
                context.player1.clickCard(context.battlefieldMarine);

                context.player1.clickCard(context.chancellorPalpatine);
                expect(context.chancellorPalpatine.exhausted).toBe(true);
                expect(context.chancellorPalpatine.onStartingSide).toBe(false);
                expect(context.p2Base.damage).toBe(0);
                expect(context.player1.findCardsByName('clone-trooper').length).toBe(0);
            });

            it('back-side creates a clone, deals 2 damage to enemy base, and flips if a Villainy card has been played', function () {
                const { context } = contextRef;

                expect(context.chancellorPalpatine.onStartingSide).toBe(false);
                expect(context.player1.findCardsByName('clone-trooper').length).toBe(0);

                context.player1.clickCard(context.pykeSentinel);
                context.player2.passAction();

                context.player1.clickCard(context.chancellorPalpatine);
                expect(context.chancellorPalpatine.onStartingSide).toBe(true);
                expect(context.chancellorPalpatine.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(2);
                const cloneTroopers = context.player1.findCardsByName('clone-trooper');
                expect(cloneTroopers.length).toBe(1);
                expect(cloneTroopers[0]).toBeInZone('groundArena');
            });
        });
    });
});
