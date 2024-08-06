describe('Otter Fisherman', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['otter-fisherman', 'isawa-tadaka']
                },
                player2: {
                    inPlay: ['solemn-scholar', 'kitsu-motso']
                }
            });

            this.otterFisherman = this.player1.findCardByName('otter-fisherman');
            this.isawaTadaka = this.player1.findCardByName('isawa-tadaka');

            this.solemnScholar = this.player2.findCardByName('solemn-scholar');
            this.kitsuMotso = this.player2.findCardByName('kitsu-motso');
            this.player1.player.imperialFavor = 'political';
        });

        it('should not be able to trigger in a non-water conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.otterFisherman],
                defenders: [],
                type: 'political',
                ring: 'earth'
            });

            this.player2.pass();
            this.player1.pass();
            this.player1.clickPrompt('Don\'t resolve');

            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not be able to trigger when the opponent claims the ring', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.otterFisherman],
                defenders: [this.kitsuMotso],
                type: 'political',
                ring: 'water'
            });

            this.player2.pass();
            this.player1.pass();

            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should be able to trigger in a political water conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.otterFisherman],
                defenders: [],
                type: 'political',
                ring: 'water'
            });

            this.player2.pass();
            this.player1.pass();
            this.player1.clickPrompt('Don\'t resolve');

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.otterFisherman);
        });

        it('should be able to trigger in a military water conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.isawaTadaka],
                defenders: [],
                type: 'military',
                ring: 'water'
            });

            this.player2.pass();
            this.player1.pass();
            this.player1.clickPrompt('No');
            this.player1.clickPrompt('Don\'t resolve');

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.otterFisherman);
        });

        it('should be able to trigger in a water conflict where fisherman is not participating', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.isawaTadaka],
                defenders: [],
                type: 'political',
                ring: 'water'
            });

            this.player2.pass();
            this.player1.pass();
            this.player1.clickPrompt('No');
            this.player1.clickPrompt('Don\'t resolve');

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.otterFisherman);
        });

        it('should prompt player2 to choose one of the options', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.otterFisherman],
                defenders: [],
                type: 'political',
                ring: 'water'
            });

            this.player2.pass();
            this.player1.pass();
            this.player1.clickPrompt('Don\'t resolve');

            this.player1.clickCard(this.otterFisherman);
            expect(this.player2).toHavePrompt('Choose an option for your opponent');
            expect(this.player2.currentButtons).toContain('Opponent gains 1 fate');
            expect(this.player2.currentButtons).toContain('Opponent gains 1 honor');
            expect(this.player2.currentButtons).toContain('Opponent draws 1 card');
        });

        it('should give player1 1 honor if chosen', function() {
            let initialHonor = this.player1.honor;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.otterFisherman],
                defenders: [],
                type: 'political',
                ring: 'water'
            });

            this.player2.pass();
            this.player1.pass();
            this.player1.clickPrompt('Don\'t resolve');

            this.player1.clickCard(this.otterFisherman);
            this.player2.clickPrompt('Opponent gains 1 honor');

            expect(this.player1.honor).toBe(initialHonor + 1);
            expect(this.getChatLogs(3)).toContain('player1 uses Otter Fisherman to gain 1 honor');
        });

        it('should give player1 1 fate if chosen', function() {
            let initialFate = this.player1.fate;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.otterFisherman],
                defenders: [],
                type: 'political',
                ring: 'water'
            });

            this.player2.pass();
            this.player1.pass();
            this.player1.clickPrompt('Don\'t resolve');

            this.player1.clickCard(this.otterFisherman);
            this.player2.clickPrompt('Opponent gains 1 fate');

            expect(this.player1.fate).toBe(initialFate + 1);
            expect(this.getChatLogs(3)).toContain('player1 uses Otter Fisherman to gain 1 fate');
        });

        it('should give player1 1 card if chosen', function() {
            let initialHandSize = this.player1.hand.length;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.otterFisherman],
                defenders: [],
                type: 'political',
                ring: 'water'
            });

            this.player2.pass();
            this.player1.pass();
            this.player1.clickPrompt('Don\'t resolve');

            this.player1.clickCard(this.otterFisherman);
            this.player2.clickPrompt('Opponent draws 1 card');

            expect(this.player1.hand.length).toBe(initialHandSize + 1);
            expect(this.getChatLogs(3)).toContain('player1 uses Otter Fisherman to draw 1 card');
        });
    });
});
