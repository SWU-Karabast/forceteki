describe('Headhunting', function() {
    integration(function() {
        describe('Headhunting\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['headhunting'],
                        groundArena: ['atst', 'reputable-hunter', 'discerning-veteran', 'wampa', { card: 'battlefield-marine', exhausted: true }],
                        spaceArena: ['tieln-fighter'],
                        leader: 'the-mandalorian#sworn-to-the-creed'
                    },
                    player2: {
                        groundArena: ['bounty-guild-initiate', 'consular-security-force'],
                    }
                });
            });

            it('should attack with three units', function () {
                this.player1.clickCard(this.headhunting);
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.reputableHunter, this.discerningVeteran, this.wampa]);
                expect(this.player1).toHaveEnabledPromptButton('Pass ability'); // TODO THIS PR: fix this

                // first attack, bounty hunter
                this.player1.clickCard(this.reputableHunter);
                expect(this.player1).toBeAbleToSelectExactly([this.bountyGuildInitiate, this.consularSecurityForce]);
                this.player1.clickCard(this.consularSecurityForce);
                expect(this.reputableHunter.exhausted).toBe(true);
                expect(this.consularSecurityForce.damage).toBe(5);
                expect(this.reputableHunter.damage).toBe(3);

                // second attack, non-bounty-hunter
                this.consularSecurityForce.damage = 0;
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.discerningVeteran, this.wampa]);
                this.player1.clickCard(this.atst);
                expect(this.player1).toBeAbleToSelectExactly([this.bountyGuildInitiate, this.consularSecurityForce]);
                this.player1.clickCard(this.consularSecurityForce);
                expect(this.atst.exhausted).toBe(true);
                expect(this.consularSecurityForce.damage).toBe(6);
                expect(this.atst.damage).toBe(3);

                // third attack, bounty hunter
                this.consularSecurityForce.damage = 0;
                expect(this.player1).toBeAbleToSelectExactly([this.discerningVeteran, this.wampa]);
                this.player1.clickCard(this.discerningVeteran);
                expect(this.player1).toBeAbleToSelectExactly([this.bountyGuildInitiate, this.consularSecurityForce]);
                this.player1.clickCard(this.consularSecurityForce);
                expect(this.discerningVeteran.exhausted).toBe(true);
                expect(this.consularSecurityForce.damage).toBe(5);
                expect(this.discerningVeteran.damage).toBe(3);

                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});
