describe('Peli Motto, You Bring the Cash?', function() {
    integration(function(contextRef) {
        describe('while in play', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        // identity aspects: Command (base) + Vigilance/Heroism (leader)
                        base: 'echo-base',
                        leader: 'luke-skywalker#faithful-friend',
                        groundArena: ['peli-motto#you-bring-the-cash', 'battlefield-marine'],
                        // daring-raid (Aggression) and bokken-saber (Aggression) are off-aspect (+2 penalty),
                        // smugglers-aid (Heroism) is on-aspect, seasoned-shoretrooper (Villainy/Command) is an off-aspect unit
                        hand: ['daring-raid', 'daring-raid', 'daring-raid', 'smugglers-aid', 'seasoned-shoretrooper', 'bokken-saber'],
                        resources: 10
                    },
                    player2: {}
                });
            });

            it('ignores the aspect penalty on the first non-unit card played each phase, but not subsequent ones', function () {
                const { context } = contextRef;
                const daringRaids = context.player1.findCardsByName('daring-raid');

                // first non-unit card: aspect penalty ignored, costs 1 instead of 3
                context.player1.clickCard(daringRaids[0]);
                context.player1.clickCard(context.p2Base);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                context.player2.passAction();

                // second non-unit card: aspect penalty applies, costs 3
                context.player1.clickCard(daringRaids[1]);
                context.player1.clickCard(context.p2Base);
                expect(context.player1.exhaustedResourceCount).toBe(4);

                context.player2.passAction();

                // the discount resets each phase
                context.moveToNextActionPhase();
                expect(context.player1.exhaustedResourceCount).toBe(0);

                context.player1.clickCard(daringRaids[2]);
                context.player1.clickCard(context.p2Base);
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('does not count units played toward the first non-unit card', function () {
                const { context } = contextRef;
                const daringRaids = context.player1.findCardsByName('daring-raid');

                // play a unit first (off-aspect, costs 4) - this should not consume the non-unit discount
                context.player1.clickCard(context.seasonedShoretrooper);
                expect(context.player1.exhaustedResourceCount).toBe(4);

                context.player2.passAction();

                // first non-unit card still ignores the aspect penalty, costs 1
                context.player1.clickCard(daringRaids[0]);
                context.player1.clickCard(context.p2Base);
                expect(context.player1.exhaustedResourceCount).toBe(5);
            });

            it('counts an on-aspect non-unit card as the first non-unit card, removing the discount from later ones', function () {
                const { context } = contextRef;
                const daringRaids = context.player1.findCardsByName('daring-raid');

                // first non-unit card is on-aspect (no penalty anyway) but still consumes the discount
                context.player1.clickCard(context.smugglersAid);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                context.player2.passAction();

                // second non-unit card now pays the aspect penalty, costs 3
                context.player1.clickCard(daringRaids[0]);
                context.player1.clickCard(context.p2Base);
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            it('ignores the aspect penalty on an off-aspect upgrade played as the first non-unit card', function () {
                const { context } = contextRef;

                // bokken-saber is an off-aspect (Aggression) upgrade, base cost 1
                context.player1.clickCard(context.bokkenSaber);
                context.player1.clickCard(context.battlefieldMarine);

                // aspect penalty ignored: costs 1 instead of 3
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['bokken-saber']);
            });
        });

        describe('with pilot upgrades', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        leader: 'luke-skywalker#faithful-friend',
                        groundArena: ['peli-motto#you-bring-the-cash'],
                        spaceArena: ['green-squadron-awing', 'xwing'],
                        hand: ['independent-smuggler', 'daring-raid'],
                        resources: 10
                    },
                    player2: {}
                });
            });

            it('ignores the aspect penalty on a pilot played as the first non-unit (upgrade) card', function () {
                const { context } = contextRef;

                // independent-smuggler (Cunning) is off-aspect; played as a pilot upgrade it should cost 1 instead of 3
                context.player1.clickCard(context.independentSmuggler);
                context.player1.clickPrompt('Play Independent Smuggler with Piloting');
                context.player1.clickCard(context.xwing);

                expect(context.xwing).toHaveExactUpgradeNames(['independent-smuggler']);
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('counts a pilot upgrade as the first non-unit card, so later non-unit cards pay the penalty', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.independentSmuggler);
                context.player1.clickPrompt('Play Independent Smuggler with Piloting');
                context.player1.clickCard(context.xwing);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                context.player2.passAction();

                // the pilot upgrade consumed the first non-unit slot, so daring-raid pays the penalty (cost 3)
                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.p2Base);
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });
        });

        describe('when it enters play after a non-unit card was already played this phase', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        leader: 'luke-skywalker#faithful-friend',
                        hand: ['peli-motto#you-bring-the-cash', 'daring-raid', 'daring-raid'],
                        resources: 10
                    },
                    player2: {}
                });
            });

            it('does not let the next non-unit card ignore the aspect penalty', function () {
                const { context } = contextRef;
                const daringRaids = context.player1.findCardsByName('daring-raid');

                // play a non-unit before Peli is in play: pays the aspect penalty, costs 3
                context.player1.clickCard(daringRaids[0]);
                context.player1.clickCard(context.p2Base);
                expect(context.player1.exhaustedResourceCount).toBe(3);

                context.player2.passAction();

                // play Peli Motto (off-aspect Cunning unit, costs 1 + 2 penalty = 3)
                context.player1.clickCard(context.peliMotto);
                expect(context.player1.exhaustedResourceCount).toBe(6);

                context.player2.passAction();

                // a non-unit card was already played this phase, so this one is not the first: still costs 3
                context.player1.clickCard(daringRaids[1]);
                context.player1.clickCard(context.p2Base);
                expect(context.player1.exhaustedResourceCount).toBe(9);
            });
        });

        describe('when another player gains control of it', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        leader: 'luke-skywalker#faithful-friend',
                        hand: ['daring-raid'],
                        resources: 10
                    },
                    player2: {
                        base: 'echo-base',
                        leader: 'chewbacca#walking-carpet',
                        // Peli Motto is owned by player1 but controlled by player2
                        groundArena: [{ card: 'peli-motto#you-bring-the-cash', owner: 'player1' }],
                        hand: ['daring-raid'],
                        resources: 10
                    }
                });
            });

            it('lets the controller ignore the aspect penalty, not the owner', function () {
                const { context } = contextRef;
                const player1Raid = context.player1.findCardsByName('daring-raid')[0];
                const player2Raid = context.player2.findCardsByName('daring-raid')[0];

                // player1 owns Peli but does not control it: still pays the aspect penalty, costs 3
                context.player1.clickCard(player1Raid);
                context.player1.clickCard(context.p2Base);
                expect(context.player1.exhaustedResourceCount).toBe(3);

                // player2 controls Peli: ignores the aspect penalty on their first non-unit card, costs 1
                context.player2.clickCard(player2Raid);
                context.player2.clickCard(context.p1Base);
                expect(context.player2.exhaustedResourceCount).toBe(1);
            });
        });

        describe('when an opponent steals it mid-game with Maul, Master of the Shadow Collective', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        leader: 'luke-skywalker#faithful-friend',
                        groundArena: ['peli-motto#you-bring-the-cash'],
                        resources: 10
                    },
                    player2: {
                        base: 'echo-base',
                        leader: 'chewbacca#walking-carpet',
                        groundArena: ['maul#master-of-the-shadow-collective'],
                        hand: ['daring-raid'],
                        resources: 10
                    }
                });
            });

            it('grants the discount to the player who takes control of it', function () {
                const { context } = contextRef;

                context.player1.passAction();

                // Maul attacks player1's base and steals Peli Motto (a unit ability, not a card play)
                context.player2.clickCard(context.maul);
                context.player2.clickCard(context.p1Base);
                expect(context.player2).toBeAbleToSelectExactly([context.peliMotto]);
                context.player2.clickCard(context.peliMotto);
                expect(context.peliMotto.controller).toBe(context.player2Object);

                context.player1.passAction();

                // player2 now controls Peli: their first non-unit card ignores the aspect penalty, costs 1
                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.p1Base);
                expect(context.player2.exhaustedResourceCount).toBe(1);
            });
        });
    });
});
