
describe('Interceptor Ace', function() {
    integration(function(contextRef) {
        describe('Interceptor Ace ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['interceptor-ace'],
                        groundArena: ['snowspeeder'],
                        spaceArena: ['alliance-xwing', { card: 'devastating-gunship', damage: 2 }]
                    },
                    player2: {
                        hand: ['daring-raid', 'bamboozle'],
                        spaceArena: ['restored-arc170']
                    }
                });
            });

            it('should give Grit to the attached unit when played as a pilot', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.interceptorAce);
                context.player1.clickPrompt('Play Interceptor Ace with Piloting');
                context.player1.clickCard(context.allianceXwing);

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.allianceXwing);
                expect(context.allianceXwing.damage).toBe(2);
                expect(context.allianceXwing.getPower()).toBe(6); // 2 Base Power + 2 from Pilot + 2 from Grit
                expect(context.allianceXwing.getHp()).toBe(6); // 3 Base HP + 3 from Pilot
            });

            it('should not duplicate unit\'s power to the attached unit with Grit when played as a pilot', function() {
                const { context } = contextRef;

                expect(context.devastatingGunship.getPower()).toBe(5); // 3 Base Power + 2 from Grit
                context.player1.clickCard(context.interceptorAce);
                context.player1.clickPrompt('Play Interceptor Ace with Piloting');
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.devastatingGunship, context.snowspeeder]);
                context.player1.clickCard(context.devastatingGunship);

                expect(context.devastatingGunship.getPower()).toBe(7); // 3 Base Power + 2 from Pilot + 2 from Grit
                expect(context.devastatingGunship.getHp()).toBe(8); // 5 Base HP + 3 from Pilot
            });

            it('should correctly unregister and re-register keyword abilities when leaving and re-entering the arena', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.interceptorAce);
                context.player1.clickPrompt('Play Interceptor Ace with Piloting');
                context.player1.clickCard(context.allianceXwing);

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.allianceXwing);
                expect(context.allianceXwing.damage).toBe(2);
                expect(context.allianceXwing.getPower()).toBe(6); // 2 Base Power + 2 from Pilot + 2 from Grit
                expect(context.allianceXwing.getHp()).toBe(6); // 3 Base HP + 3 from Pilot

                context.player1.passAction();

                context.player2.clickCard(context.bamboozle);
                context.player2.clickCard(context.allianceXwing);
                expect(context.interceptorAce).toBeInZone('hand');
                expect(context.allianceXwing.damage).toBe(2);
                expect(context.allianceXwing.getPower()).toBe(2); // 2 Base Power
                expect(context.allianceXwing.getHp()).toBe(3);

                context.player1.clickCard(context.interceptorAce);
                context.player1.clickPrompt('Play Interceptor Ace with Piloting');
                context.player1.clickCard(context.allianceXwing);

                expect(context.allianceXwing.damage).toBe(2);
                expect(context.allianceXwing.getPower()).toBe(6);
                expect(context.allianceXwing.getHp()).toBe(6);
            });

            it('should have Grit as a Unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.interceptorAce);
                context.player1.clickPrompt('Play Interceptor Ace');

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.interceptorAce);
                expect(context.interceptorAce.damage).toBe(2);
                expect(context.interceptorAce.getPower()).toBe(4); // 2 Base Power + 2 from Grit
                expect(context.allianceXwing.getHp()).toBe(3);
            });
        });
    });
});