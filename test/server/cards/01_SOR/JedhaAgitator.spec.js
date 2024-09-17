describe('Jedha Agitator', function() {
    integration(function() {
        // describe('Jedha Agitator\'s on attack ability', function() {
        //     beforeEach(function () {
        //         this.setupTest({
        //             phase: 'action',
        //             player1: {
        //                 groundArena: ['jedha-agitator'],
        //             },
        //             player2: {
        //                 groundArena: ['wampa'],
        //                 spaceArena: ['cartel-spacer']
        //             }
        //         });
        //     });

        //     it('should do nothing if no leader is deployed', function () {
        //         this.player1.clickCard(this.jedhaAgitator);
        //         this.player1.clickCard(this.p2Base);
        //         expect(this.jedhaAgitator.exhausted).toBe(true);

        //         expect(this.player2).toBeActivePlayer();
        //     });
        // });

        describe('Jedha Agitator\'s on attack ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['jedha-agitator', 'battlefield-marine'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should deal 2 damage to a ground unit or base if a leader is deployed', function () {
                this.player1.clickCard(this.jedhaAgitator);
                this.player1.clickCard(this.p2Base);

                expect(this.player1).toHaveEnabledPromptButton('If you control a leader unit, deal 2 damage to a ground unit or base');
                expect(this.player1).toHaveEnabledPromptButton('Saboteur: defeat all shields');
                expect(this.jedhaAgitator.exhausted).toBe(true);

                this.player1.clickPrompt('If you control a leader unit, deal 2 damage to a ground unit or base');
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.jedhaAgitator, this.battlefieldMarine, this.p1Base, this.p2Base, this.bobaFett]);
                this.player1.clickCard(this.battlefieldMarine);
                expect(this.battlefieldMarine.damage).toBe(2);

                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});
