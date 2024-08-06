describe('Mantis Raider', function () {
    integration(function () {
        describe('unnoposed fate steal', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['mantis-raider']
                    },
                    player2: {
                        inPlay: ['solemn-scholar'],
                        fate: 2
                    }
                });

                this.mantisRaider =
                    this.player1.findCardByName('mantis-raider');
                this.solemScholar =
                    this.player2.findCardByName('solemn-scholar');
            });

            it('does not trigger outside a conflict', function () {
                this.player1.clickCard(this.mantisRaider);
                expect(this.player1).toHavePrompt('Action Window');
            });

            it('does not trigger when attacking opposed', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.mantisRaider],
                    defenders: [this.solemScholar]
                });
                expect(this.player1).not.toBeAbleToSelect(this.mantisRaider);
                expect(this.player1).toHavePrompt(
                    'Waiting for opponent to take an action or pass'
                );
            });

            it('take fate from the opponent when attacking unopposed', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.mantisRaider],
                    defenders: []
                });

                let raiderFateBefore = this.mantisRaider.fate;
                let opponentFateBefore = this.player2.fate;
                this.player1.clickCard(this.mantisRaider);
                expect(this.mantisRaider.fate).toBe(raiderFateBefore + 1);
                expect(this.player2.fate).toBe(opponentFateBefore - 1);
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Mantis Raider to take a fate from player2 and place it on Mantis Raider.'
                );
            });
        });

        describe('skill pump', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['mantis-raider']
                    },
                    player2: {
                        inPlay: ['solemn-scholar']
                    }
                });

                this.mantisRaider =
                    this.player1.findCardByName('mantis-raider');
                this.mantisRaider.fate = 2;
                this.solemScholar =
                    this.player2.findCardByName('solemn-scholar');
            });

            it('gains skill bonuses by paying fate', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.mantisRaider],
                    defenders: [this.solemScholar]
                });

                this.player2.pass();
                this.player1.clickCard(this.mantisRaider);
                expect(this.mantisRaider.militarySkill).toBe(3);
                expect(this.mantisRaider.fate).toBe(1);
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Mantis Raider, removing 1 fate from Mantis Raider to give himself +1military'
                );

                this.player2.pass();
                this.player1.clickCard(this.mantisRaider);
                expect(this.mantisRaider.fate).toBe(0);
                expect(this.mantisRaider.militarySkill).toBe(4);
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Mantis Raider, removing 1 fate from Mantis Raider to give himself +1military'
                );
            });
        });
    });
});
