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
                        groundArena: ['wampa'],
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
                    context.wampa,
                    context.victorLeader,
                    context.tieBomber
                ]);

                // select Victor Leader and confirm that TIE Bomber no longer has the effect
                context.player1.clickCard(context.victorLeader);
                expect(context.tieBomber.getPower()).toBe(0);
                expect(context.tieBomber.getHp()).toBe(4);

                // can choose from 0 - 9 resources since 1 was paid for Force Lightning already
                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 10 }, (x, i) => `${i}`));
                context.player1.chooseListOption('1');

                expect(context.victorLeader.damage).toBe(2);
            });
        });
    });
});
