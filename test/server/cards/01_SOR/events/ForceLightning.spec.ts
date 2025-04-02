describe('Force Lightning', function() {
    integration(function(contextRef) {
        describe('Force Lightning\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        hand: ['force-lightning'],
                        groundArena: ['darth-maul#revenge-at-last'],
                        spaceArena: ['fireball#an-explosion-with-wings'],
                        resources: 10
                    },
                    player2: {
                        base: { card: 'chopper-base', damage: 5 },
                        groundArena: ['atst'],
                        spaceArena: ['victor-leader#leading-from-the-front', 'tie-bomber'],
                    }
                });
            });

            it('should remove a unit\'s abilities for the phase and deal damage to it for 2x the amount of resources paid', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.forceLightning);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthMaul,
                    context.fireball,
                    context.atst,
                    context.victorLeader,
                    context.tieBomber
                ]);

                // select Victor Leader and confirm that TIE Bomber no longer has the effect
                context.player1.clickCard(context.victorLeader);
                expect(context.tieBomber.getPower()).toBe(0);
                expect(context.tieBomber.getHp()).toBe(4);

                // can choose from 0 - 9 resources since 1 was paid for Force Lightning already
                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 10 }, (_x, i) => `${i}`));
                context.player1.chooseListOption('1');

                expect(context.victorLeader.damage).toBe(2);
                expect(context.player1.exhaustedResourceCount).toBe(2);

                // ability is un-blanked after the action phase ends
                context.moveToRegroupPhase();
                expect(context.tieBomber.getPower()).toBe(1);
                expect(context.tieBomber.getHp()).toBe(5);
            });

            it('should always deal damage equal to 2x the resources paid', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.forceLightning);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthMaul,
                    context.fireball,
                    context.atst,
                    context.victorLeader,
                    context.tieBomber
                ]);

                context.player1.clickCard(context.atst);
                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 10 }, (_x, i) => `${i}`));
                context.player1.chooseListOption('3');
                expect(context.atst.damage).toBe(6);
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            it('should allow choosing 0 damage but still blank the target card', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.forceLightning);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthMaul,
                    context.fireball,
                    context.atst,
                    context.victorLeader,
                    context.tieBomber
                ]);

                // select Victor Leader and confirm that TIE Bomber no longer has the effect
                context.player1.clickCard(context.victorLeader);
                expect(context.tieBomber.getPower()).toBe(0);
                expect(context.tieBomber.getHp()).toBe(4);

                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 10 }, (_x, i) => `${i}`));
                context.player1.chooseListOption('0');

                expect(context.victorLeader.damage).toBe(0);
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('should allow exhausting all available resources', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.forceLightning);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthMaul,
                    context.fireball,
                    context.atst,
                    context.victorLeader,
                    context.tieBomber
                ]);

                context.player1.clickCard(context.atst);
                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 10 }, (_x, i) => `${i}`));
                context.player1.chooseListOption('9');
                expect(context.atst).toBeInZone('discard');
                expect(context.player1.exhaustedResourceCount).toBe(10);
            });

            it('should not prevent triggers that happen at the beginning of the regroup phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.forceLightning);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthMaul,
                    context.fireball,
                    context.atst,
                    context.victorLeader,
                    context.tieBomber
                ]);

                context.player1.clickCard(context.fireball);
                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 10 }, (_x, i) => `${i}`));
                context.player1.chooseListOption('0');
                expect(context.fireball.damage).toBe(0);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                context.moveToNextActionPhase();
                expect(context.fireball.damage).toBe(1);
            });
        });
    });
});
