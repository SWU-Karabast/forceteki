describe('Republic Tactical Officer', function() {
    integration(function(contextRef) {
        describe('Republic Tactical Officer\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['republic-tactical-officer'],
                        groundArena: ['phase-i-clone-trooper', 'mon-mothma#voice-of-the-rebellion'],
                        spaceArena: ['headhunter-squadron']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should allow triggering an attack by a republic unit when played and git it +2 power', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.republicTacticalOfficer);
                expect(context.republicTacticalOfficer).toBeInLocation('ground arena');

                expect(context.player1).toBeAbleToSelectExactly([context.phaseICloneTrooper, context.headhunterSquadron]);

                context.player1.clickCard(context.phaseICloneTrooper);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.sundariPeacekeeper]);

                context.player1.clickCard(context.sundariPeacekeeper);
                expect(context.phaseICloneTrooper.exhausted).toBe(true);
                expect(context.phaseICloneTrooper.damage).toBe(1);
                expect(context.sundariPeacekeeper).toBeInLocation('discard');

                // do a second attack to confirm that the +2 bonus has expired
                context.player2.passAction();

                context.phaseICloneTrooper.exhausted = false;

                context.player1.clickCard(context.phaseICloneTrooper);

                expect(context.p2Base.damage).toBe(3);
            });

            it('should allow the user to pass on the attack at the attacker select stage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.republicTacticalOfficer);
                expect(context.republicTacticalOfficer).toBeInLocation('ground arena');

                context.player1.clickPrompt('Pass ability');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
