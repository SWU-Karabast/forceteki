describe('Overwhelming Barrage', function() {
    integration(function() {
        describe('Overwhelming Barrage\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['overwhelming-barrage'],
                        groundArena: ['wampa', 'battlefield-marine'],
                        leader: { card: 'leia-organa#alliance-general', deployed: true }
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'han-solo#audacious-smuggler', deployed: true }
                    }
                });
            });

            it('should give a friendly unit +2/+2 for the phase and allow it to distribute its power as damage across other units', function () {
                this.player1.clickCard(this.overwhelmingBarrage);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.battlefieldMarine, this.leiaOrgana]);
                this.player1.clickCard(this.wampa);
                expect(this.player1).toBeAbleToSelectExactly([this.battlefieldMarine, this.leiaOrgana, this.atst, this.tielnFighter, this.hanSolo]);
                expect(this.player1).toHaveChooseNoTargetButton();
                this.player1.setDistributeDamagePromptState(new Map([
                    [this.atst, 2],
                    [this.battlefieldMarine, 2],
                    [this.tielnFighter, 1],
                    [this.hanSolo, 1]
                ]));

                expect(this.leiaOrgana.damage).toBe(0);
                expect(this.wampa.damage).toBe(0);
                expect(this.atst.damage).toBe(2);
                expect(this.battlefieldMarine.damage).toBe(2);
                expect(this.tielnFighter).toBeInLocation('discard');
                expect(this.hanSolo.damage).toBe(1);

                // attack into wampa to confirm stats buff
                this.atst.damage = 0;
                this.player2.clickCard(this.atst);
                this.player2.clickCard(this.wampa);
                expect(this.wampa).toBeInLocation('ground arena');
                expect(this.wampa.damage).toBe(6);
                expect(this.atst).toBeInLocation('ground arena');
                expect(this.atst.damage).toBe(6);
            });

            it('should be able to put all damage on a single target and exceed its HP total', function () {
                this.player1.clickCard(this.overwhelmingBarrage);
                this.player1.clickCard(this.wampa);
                expect(this.player1).toBeAbleToSelectExactly([this.battlefieldMarine, this.leiaOrgana, this.atst, this.tielnFighter, this.hanSolo]);
                this.player1.setDistributeDamagePromptState(new Map([
                    [this.tielnFighter, 6]
                ]));

                expect(this.leiaOrgana.damage).toBe(0);
                expect(this.wampa.damage).toBe(0);
                expect(this.atst.damage).toBe(0);
                expect(this.wampa.damage).toBe(0);
                expect(this.tielnFighter).toBeInLocation('discard');
                expect(this.hanSolo.damage).toBe(0);
            });

            it('should be able to choose 0 targets', function () {
                this.player1.clickCard(this.overwhelmingBarrage);
                this.player1.clickCard(this.wampa);
                expect(this.player1).toBeAbleToSelectExactly([this.battlefieldMarine, this.leiaOrgana, this.atst, this.tielnFighter, this.hanSolo]);
                this.player1.clickPrompt('Choose no targets');

                expect(this.leiaOrgana.damage).toBe(0);
                expect(this.wampa.damage).toBe(0);
                expect(this.atst.damage).toBe(0);
                expect(this.wampa.damage).toBe(0);
                expect(this.tielnFighter.damage).toBe(0);
                expect(this.hanSolo.damage).toBe(0);
                expect(this.player2).toBeActivePlayer();

                // attack into wampa to confirm stats buff
                this.atst.damage = 0;
                this.player2.clickCard(this.atst);
                this.player2.clickCard(this.wampa);
                expect(this.wampa).toBeInLocation('ground arena');
                expect(this.wampa.damage).toBe(6);
                expect(this.atst).toBeInLocation('ground arena');
                expect(this.atst.damage).toBe(6);
            });
        });

        describe('Overwhelming Barrage\'s ability, if there is only one target for damage,', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['overwhelming-barrage'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });
            });

            it('should not automatically select that target', function () {
                this.player1.clickCard(this.overwhelmingBarrage);
                expect(this.player1).toBeAbleToSelectExactly([this.consularSecurityForce]);
            });
        });
    });
});
