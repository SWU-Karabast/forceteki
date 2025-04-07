describe('Hera Syndulla, We\'ve Lost Enough', function() {
    integration(function(contextRef) {
        describe('Hera\'s piloting ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hera-syndulla#weve-lost-enough', 'survivors-gauntlet'],
                        groundArena: ['snowspeeder'],
                        spaceArena: ['alliance-xwing', 'restored-arc170'],
                        base: { card: 'chopper-base', damage: 5 }
                    },
                    player2: {
                        hand: ['bamboozle']
                    }
                });
            });

            it('should give restore 1 to the attached unit when played as a pilot', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.heraSyndulla);
                context.player1.clickPrompt('Play Hera Syndulla with Piloting');
                context.player1.clickCard(context.allianceXwing);

                context.player2.passAction();

                context.player1.clickCard(context.allianceXwing);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(4);
            });

            it('should correctly stack restore with the attached unit\'s printed restore', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.heraSyndulla);
                context.player1.clickPrompt('Play Hera Syndulla with Piloting');
                context.player1.clickCard(context.restoredArc170);

                context.player2.passAction();

                context.player1.clickCard(context.restoredArc170);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(3);
            });

            it('should not give restore 1 to other units than the attached when played as a pilot', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.heraSyndulla);
                context.player1.clickPrompt('Play Hera Syndulla with Piloting');
                context.player1.clickCard(context.allianceXwing);

                context.player2.passAction();

                context.player1.clickCard(context.snowspeeder);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(5);
            });

            it('should only have Restore 1 (not 2) when played as a unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.heraSyndulla);
                context.player1.clickPrompt('Play Hera Syndulla');

                context.player2.passAction();

                context.readyCard(context.heraSyndulla);
                context.player1.clickCard(context.heraSyndulla);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(4);
            });

            it('should correctly unregister and re-register keyword abilities when leaving and re-entering the arena', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.heraSyndulla);
                context.player1.clickPrompt('Play Hera Syndulla with Piloting');
                context.player1.clickCard(context.allianceXwing);

                context.player2.clickCard(context.bamboozle);
                context.player2.clickCard(context.allianceXwing);
                expect(context.heraSyndulla).toBeInZone('hand');

                context.player1.clickCard(context.heraSyndulla);
                context.player1.clickPrompt('Play Hera Syndulla with Piloting');
                context.player1.clickCard(context.allianceXwing);

                context.player2.passAction();

                context.readyCard(context.allianceXwing);
                context.player1.clickCard(context.allianceXwing);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(4);
            });
        });
    });
});