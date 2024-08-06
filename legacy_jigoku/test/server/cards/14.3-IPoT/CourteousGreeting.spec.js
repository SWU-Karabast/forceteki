describe('Courteous Greeting', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['tattooed-wanderer', 'solemn-scholar'],
                    provinces: ['fertile-fields', 'entrenched-position']
                },
                player2: {
                    provinces: ['courteous-greeting', 'toshi-ranbo', 'upholding-authority'],
                    inPlay: ['shrine-maiden', 'shika-matchmaker']
                }
            });

            this.greeting = this.player2.findCardByName('courteous-greeting');
            this.toshiRanbo = this.player2.findCardByName('toshi-ranbo');
            this.upholding = this.player2.findCardByName('upholding-authority');
            this.maiden = this.player2.findCardByName('shrine-maiden');
            this.matchmaker = this.player2.findCardByName('shika-matchmaker');

            this.fields = this.player1.findCardByName('fertile-fields');
            this.entrenched = this.player1.findCardByName('entrenched-position');
            this.scholar = this.player1.findCardByName('solemn-scholar');
            this.wanderer = this.player1.findCardByName('tattooed-wanderer');

            this.greeting.facedown = false;
            this.noMoreActions();
        });

        it('should trigger when it is the attacked province', function() {
            this.initiateConflict({
                province: this.greeting,
                ring: 'earth',
                type: 'military',
                attackers: [this.wanderer],
                defenders: [this.maiden]
            });
            this.player2.clickCard(this.greeting);
            expect(this.player2).toHavePrompt('Courteous Greeting');
        });

        it('should be able to target characters in the conflict but not at home - targeting is my character first, then opponent', function() {
            this.initiateConflict({
                province: this.greeting,
                ring: 'earth',
                type: 'military',
                attackers: [this.wanderer],
                defenders: [this.maiden]
            });
            this.player2.clickCard(this.greeting);
            expect(this.player2).toBeAbleToSelect(this.maiden);
            expect(this.player2).not.toBeAbleToSelect(this.matchmaker);
            this.player2.clickCard(this.maiden);
            expect(this.player2).toBeAbleToSelect(this.wanderer);
            expect(this.player2).not.toBeAbleToSelect(this.scholar);
        });

        it('should require targeting characters controlled by both players', function() {
            this.initiateConflict({
                province: this.greeting,
                ring: 'earth',
                type: 'military',
                attackers: [this.wanderer],
                defenders: [this.maiden]
            });
            this.player2.clickCard(this.greeting);
            this.player2.clickCard(this.maiden);
            expect(this.player2).not.toHavePromptButton('Done');
            this.player2.clickCard(this.wanderer);
        });

        it('should not work without a valid target on both sides - no defending character', function() {
            this.initiateConflict({
                province: this.greeting,
                ring: 'earth',
                type: 'military',
                attackers: [this.wanderer],
                defenders: []
            });
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.greeting);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should not work without a valid target on both sides - no standing defending character', function() {
            this.initiateConflict({
                province: this.greeting,
                ring: 'earth',
                type: 'military',
                attackers: [this.wanderer],
                defenders: [this.maiden]
            });
            this.maiden.bowed = true;
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.greeting);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should bow the chosen characters', function() {
            this.initiateConflict({
                province: this.greeting,
                ring: 'earth',
                type: 'military',
                attackers: [this.wanderer],
                defenders: [this.maiden]
            });
            expect(this.wanderer.bowed).toBe(false);
            expect(this.maiden.bowed).toBe(false);
            this.player2.clickCard(this.greeting);
            this.player2.clickCard(this.maiden);
            this.player2.clickCard(this.wanderer);
            expect(this.wanderer.bowed).toBe(true);
            expect(this.maiden.bowed).toBe(true);
        });

        it('should work at your other earth provinces', function() {
            this.initiateConflict({
                province: this.toshiRanbo,
                ring: 'earth',
                type: 'military',
                attackers: [this.wanderer],
                defenders: [this.maiden]
            });
            this.player2.clickCard(this.greeting);
            expect(this.player2).toHavePrompt('Courteous Greeting');
        });

        it('should work at your opponents earth province', function() {
            this.player1.clickPrompt('Pass Conflict');
            this.player1.clickPrompt('Yes');
            this.noMoreActions();
            this.initiateConflict({
                province: this.entrenched,
                ring: 'earth',
                type: 'military',
                attackers: [this.maiden],
                defenders: [this.wanderer]
            });
            this.player1.pass();
            this.player2.clickCard(this.greeting);
            expect(this.player2).toHavePrompt('Courteous Greeting');
        });

        it('should not work at non-earth provinces', function() {
            this.player1.clickPrompt('Pass Conflict');
            this.player1.clickPrompt('Yes');
            this.noMoreActions();
            this.initiateConflict({
                province: this.fields,
                ring: 'earth',
                type: 'military',
                attackers: [this.maiden],
                defenders: [this.wanderer]
            });
            this.player1.pass();
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.greeting);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });
    });
});
