describe('Headhunting', function() {
    integration(function() {
        describe('Headhunting\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['headhunting'],
                        groundArena: ['atst', 'reputable-hunter', 'wampa', { card: 'discerning-veteran', exhausted: true }],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'the-mandalorian#sworn-to-the-creed', deployed: true }
                    },
                    player2: {
                        groundArena: ['bounty-guild-initiate', 'consular-security-force'],
                    }
                });
            });

            it('should attack with three units', function () {
                this.player1.clickCard(this.headhunting);

                // first attack, bounty hunter
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.reputableHunter, this.theMandalorian, this.wampa]);
                expect(this.player1).toHaveEnabledPromptButton('Pass ability');
                this.player1.clickCard(this.reputableHunter);
                expect(this.player1).toBeAbleToSelectExactly([this.bountyGuildInitiate, this.consularSecurityForce]);
                expect(this.player1).toHaveEnabledPromptButton('Pass ability');
                this.player1.clickCard(this.consularSecurityForce);
                expect(this.reputableHunter.exhausted).toBe(true);
                expect(this.consularSecurityForce.damage).toBe(5);
                expect(this.reputableHunter.damage).toBe(3);

                // second attack, non-bounty-hunter
                this.consularSecurityForce.damage = 0;
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.theMandalorian, this.wampa]);
                expect(this.player1).toHaveEnabledPromptButton('Pass ability');
                this.player1.clickCard(this.atst);
                expect(this.player1).toBeAbleToSelectExactly([this.bountyGuildInitiate, this.consularSecurityForce]);
                expect(this.player1).toHaveEnabledPromptButton('Pass ability');
                this.player1.clickCard(this.consularSecurityForce);
                expect(this.atst.exhausted).toBe(true);
                expect(this.consularSecurityForce.damage).toBe(6);
                expect(this.atst.damage).toBe(3);

                // third attack, leader bounty hunter
                this.consularSecurityForce.damage = 0;
                expect(this.player1).toBeAbleToSelectExactly([this.theMandalorian, this.wampa]);
                expect(this.player1).toHaveEnabledPromptButton('Pass ability');
                this.player1.clickCard(this.theMandalorian);
                expect(this.player1).toBeAbleToSelectExactly([this.bountyGuildInitiate, this.consularSecurityForce]);
                expect(this.player1).toHaveEnabledPromptButton('Pass ability');
                this.player1.clickCard(this.consularSecurityForce);
                expect(this.theMandalorian.exhausted).toBe(true);
                expect(this.consularSecurityForce.damage).toBe(6);
                expect(this.theMandalorian.damage).toBe(3);

                expect(this.player2).toBeActivePlayer();
            });
        });

        describe('Headhunting\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['headhunting'],
                        groundArena: ['atst', 'reputable-hunter'],
                        spaceArena: ['tieln-fighter'],
                    },
                    player2: {
                        groundArena: ['bounty-guild-initiate', 'consular-security-force'],
                    }
                });
            });

            it('should attack with as many units as available and then stop', function () {
                this.player1.clickCard(this.headhunting);

                // first attack, bounty hunter
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.reputableHunter]);
                expect(this.player1).toHaveEnabledPromptButton('Pass ability');
                this.player1.clickCard(this.reputableHunter);
                expect(this.player1).toBeAbleToSelectExactly([this.bountyGuildInitiate, this.consularSecurityForce]);
                expect(this.player1).toHaveEnabledPromptButton('Pass ability');
                this.player1.clickCard(this.consularSecurityForce);
                expect(this.reputableHunter.exhausted).toBe(true);
                expect(this.consularSecurityForce.damage).toBe(5);
                expect(this.reputableHunter.damage).toBe(3);

                // second attack, non-bounty-hunter - goes straight to target resolution since only one legal attacker
                this.consularSecurityForce.damage = 0;
                expect(this.player1).toBeAbleToSelectExactly([this.bountyGuildInitiate, this.consularSecurityForce]);
                expect(this.player1).toHaveEnabledPromptButton('Pass ability');
                this.player1.clickCard(this.consularSecurityForce);
                expect(this.atst.exhausted).toBe(true);
                expect(this.consularSecurityForce.damage).toBe(6);
                expect(this.atst.damage).toBe(3);

                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});
