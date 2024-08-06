describe('Togashi Tsurumi', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-tsurumi'],
                    hand: ['hurricane-punch', 'iron-foundations-stance', 'kyofuki-s-hammer']
                },
                player2: {
                    inPlay: []
                }
            });

            this.tsurumi = this.player1.findCardByName('togashi-tsurumi');
            this.punch = this.player1.findCardByName('hurricane-punch');
            this.stance = this.player1.findCardByName('iron-foundations-stance');
            this.hammer = this.player1.findCardByName('kyofuki-s-hammer');
        });

        it('should put cards underneath self and get +1/+1 per card', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.tsurumi],
                defenders: [],
                ring: 'water'
            });
            this.player2.pass();

            let fate = this.player1.fate;
            let mil = this.tsurumi.getMilitarySkill();
            let pol = this.tsurumi.getPoliticalSkill();
            let hand = this.player1.hand.length;

            this.player1.clickCard(this.tsurumi);
            expect(this.player1).toHavePrompt('Choose a card');
            expect(this.player1).toBeAbleToSelect(this.punch);
            expect(this.player1).toBeAbleToSelect(this.stance);
            expect(this.player1).toBeAbleToSelect(this.hammer);
            this.player1.clickCard(this.punch);
            expect(this.punch.location).toBe(this.tsurumi.uuid);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Togashi Tsurumi to place a card from their hand beneath Togashi Tsurumi and draw a card'
            );

            expect(this.player1.fate).toBe(fate);
            expect(this.tsurumi.getMilitarySkill()).toBe(mil + 1);
            expect(this.tsurumi.getPoliticalSkill()).toBe(pol + 1);
            expect(this.player1.hand.length).toBe(hand);
        });

        it('kihos cards underneath self should be playable', function () {
            let initialMIL = this.tsurumi.getMilitarySkill();
            let initialPOL = this.tsurumi.getPoliticalSkill();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.tsurumi],
                defenders: [],
                ring: 'water'
            });
            this.player2.pass();

            expect(this.tsurumi.getMilitarySkill()).toBe(initialMIL);
            expect(this.tsurumi.getPoliticalSkill()).toBe(initialPOL);

            this.player1.clickCard(this.tsurumi);
            this.player1.clickCard(this.stance);

            expect(this.tsurumi.getMilitarySkill()).toBe(initialMIL + 1);
            expect(this.tsurumi.getPoliticalSkill()).toBe(initialPOL + 1);

            this.player2.pass();
            this.player1.clickCard(this.stance);
            this.player1.clickCard(this.tsurumi);
            this.player2.pass();

            expect(this.getChatLogs(5)).toContain(
                'player1 plays Iron Foundations Stance from their cards set aside by Togashi Tsurumi'
            );

            expect(this.stance.location).toBe('conflict discard pile');
            expect(this.tsurumi.getMilitarySkill()).toBe(initialMIL);
            expect(this.tsurumi.getPoliticalSkill()).toBe(initialPOL);
        });

        it('non kihos cards underneath self should not be playable', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.tsurumi],
                defenders: [],
                ring: 'water'
            });
            this.player2.pass();

            this.player1.clickCard(this.tsurumi);
            this.player1.clickCard(this.hammer);
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.hammer);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});
