describe('Shosuro Deceiver', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['shosuro-deceiver', 'doji-kuwanan', 'blackmail-artist', 'asahina-artisan'],
                    hand: ['duelist-training', 'for-shame', 'let-go', 'hawk-tattoo', 'way-with-words', 'soul-beyond-reproach']
                },
                player2: {
                    inPlay: ['beloved-advisor', 'kaiu-envoy', 'ageless-crone', 'miya-mystic', 'blackmail-artist', 'shiba-yojimbo'],
                    hand: ['cloud-the-mind', 'way-of-the-open-hand']
                }
            });

            this.deceiver = this.player1.findCardByName('shosuro-deceiver');
            this.artist = this.player1.findCardByName('blackmail-artist');
            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.dt = this.player1.findCardByName('duelist-training');
            this.shame = this.player1.findCardByName('for-shame');
            this.letGo = this.player1.findCardByName('let-go');
            this.hawk = this.player1.findCardByName('hawk-tattoo');
            this.artisan = this.player1.findCardByName('asahina-artisan');
            this.words = this.player1.findCardByName('way-with-words');
            this.soul = this.player1.findCardByName('soul-beyond-reproach');

            this.advisor = this.player2.findCardByName('beloved-advisor');
            this.envoy = this.player2.findCardByName('kaiu-envoy');
            this.crone = this.player2.findCardByName('ageless-crone');
            this.cloud = this.player2.findCardByName('cloud-the-mind');
            this.artist2 = this.player2.findCardByName('blackmail-artist');
            this.openHand = this.player2.findCardByName('way-of-the-open-hand');
            this.yojimbo = this.player2.findCardByName('shiba-yojimbo');
        });

        it('should not gain any abilities if not participating', function() {
            this.advisor.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan],
                defenders: [this.advisor],
                type: 'military'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.deceiver);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should gain action abilities on dishonored participating characters', function() {
            this.advisor.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan, this.deceiver],
                defenders: [this.advisor],
                type: 'military'
            });

            let hand1 = this.player1.hand.length;
            let hand2 = this.player2.hand.length;
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.deceiver);

            expect(this.player1.hand.length).toBe(hand1 + 1);
            expect(this.player2.hand.length).toBe(hand2 + 1);

            expect(this.getChatLogs(5)).toContain('player1 uses Shosuro Deceiver\'s gained ability from Beloved Advisor to draw 1 card');
        });

        it('should not let you use the same ability twice', function() {
            this.advisor.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan, this.deceiver],
                defenders: [this.advisor],
                type: 'military'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.deceiver);
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.deceiver);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should not let you use the same ability twice even if you lose the effect & then gain it again', function() {
            this.advisor.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan, this.deceiver],
                defenders: [this.advisor],
                type: 'military'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.deceiver);
            this.player2.clickCard(this.cloud);
            this.player2.clickCard(this.deceiver);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.deceiver);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.letGo);
            this.player1.clickCard(this.cloud);
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.deceiver);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should not get the ability if the target is clouded', function() {
            this.advisor.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan, this.deceiver],
                defenders: [this.advisor],
                type: 'military'
            });

            this.player2.clickCard(this.cloud);
            this.player2.clickCard(this.advisor);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.deceiver);
            expect(this.getChatLogs(5)).not.toContain('player1 uses Shosuro Deceiver\'s gained ability from Beloved Advisor to draw 1 card');
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.letGo);
            this.player1.clickCard(this.cloud);
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.deceiver);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            expect(this.getChatLogs(5)).toContain('player1 uses Shosuro Deceiver\'s gained ability from Beloved Advisor to draw 1 card');
        });

        it('should not regain the ability if the target is clouded', function() {
            this.advisor.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan, this.deceiver],
                defenders: [this.advisor],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.deceiver);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            expect(this.getChatLogs(5)).toContain('player1 uses Shosuro Deceiver\'s gained ability from Beloved Advisor to draw 1 card');
            this.player2.clickCard(this.cloud);
            this.player2.clickCard(this.advisor);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.deceiver);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.letGo);
            this.player1.clickCard(this.cloud);
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.deceiver);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should gain gained abilities', function() {
            this.advisor.dishonor();
            this.kuwanan.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan, this.deceiver],
                defenders: [this.advisor],
                type: 'military'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.deceiver);
            expect(this.player1).toHavePromptButton('Bow a participating character with lower military skill');
            expect(this.player1).toHavePromptButton('Each player draws 1 card');
            this.player1.clickPrompt('Cancel');
            this.player1.playAttachment(this.dt, this.kuwanan);
            this.player2.pass();
            this.player1.clickCard(this.deceiver);
            expect(this.player1).toHavePromptButton('Bow a participating character with lower military skill');
            expect(this.player1).toHavePromptButton('Each player draws 1 card');
            expect(this.player1).toHavePromptButton('Initiate a duel to bow');
        });

        it('should not gain abilities from neutral characters', function() {
            this.kuwanan.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan, this.deceiver],
                defenders: [this.advisor],
                type: 'military'
            });

            this.player2.pass();
            this.player1.playAttachment(this.dt, this.kuwanan);
            this.player2.pass();
            this.player1.clickCard(this.deceiver);
            expect(this.player1).toHavePromptButton('Bow a participating character with lower military skill');
            expect(this.player1).not.toHavePromptButton('Each player draws 1 card');
            expect(this.player1).toHavePromptButton('Initiate a duel to bow');
        });

        it('should not gain abilities from honored characters', function() {
            this.advisor.honor();
            this.kuwanan.dishonor();
            this.deceiver.honor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan, this.deceiver],
                defenders: [this.advisor],
                type: 'military'
            });

            this.player2.pass();
            this.player1.playAttachment(this.dt, this.kuwanan);
            this.player2.pass();
            this.player1.clickCard(this.deceiver);
            expect(this.player1).toHavePromptButton('Bow a participating character with lower military skill');
            expect(this.player1).not.toHavePromptButton('Each player draws 1 card');
            expect(this.player1).toHavePromptButton('Initiate a duel to bow');
        });

        it('should gain reactions', function() {
            this.advisor.dishonor();
            this.artist.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan, this.deceiver, this.artist],
                defenders: [this.advisor, this.artist2],
                type: 'political'
            });

            let honor1 = this.player1.honor;
            let honor2 = this.player2.honor;

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.artist);
            expect(this.player1).toBeAbleToSelect(this.deceiver);

            this.player1.clickCard(this.artist);
            this.player1.clickCard(this.deceiver);

            expect(this.player1.honor).toBe(honor1 + 2);
            expect(this.player2.honor).toBe(honor2 - 2);
        });

        it('should be able to gain the same reaction from different characters', function() {
            this.advisor.dishonor();
            this.artist.dishonor();
            this.artist2.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan, this.deceiver, this.artist],
                defenders: [this.advisor, this.artist2],
                type: 'political'
            });

            let honor1 = this.player1.honor;
            let honor2 = this.player2.honor;

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.artist);
            expect(this.player1).toBeAbleToSelect(this.deceiver);

            this.player1.clickCard(this.artist);
            this.player1.clickCard(this.deceiver);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.deceiver);
            this.player1.clickCard(this.deceiver);

            expect(this.player1.honor).toBe(honor1 + 3);
            expect(this.player2.honor).toBe(honor2 - 3);
        });

        it('should lose the ability if you leave the conflict', function() {
            this.advisor.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan, this.deceiver],
                defenders: [this.advisor],
                type: 'military'
            });

            this.player2.clickCard(this.openHand);
            this.player2.clickCard(this.deceiver);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.deceiver);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should not regain the ability if you leave the conflict and then go back', function() {
            this.advisor.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan, this.deceiver],
                defenders: [this.advisor],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.deceiver);
            expect(this.getChatLogs(5)).toContain('player1 uses Shosuro Deceiver\'s gained ability from Beloved Advisor to draw 1 card');
            this.player2.clickCard(this.openHand);
            this.player2.clickCard(this.deceiver);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.deceiver);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.hawk);
            this.player1.clickCard(this.deceiver);
            this.player1.clickCard(this.hawk);
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.deceiver);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should gain interrupts', function() {
            this.yojimbo.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan, this.deceiver, this.artisan],
                defenders: [this.advisor, this.yojimbo],
                type: 'military'
            });

            this.player2.clickCard(this.openHand);
            this.player2.clickCard(this.artisan);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.deceiver);
            this.player1.clickCard(this.deceiver);
            expect(this.artisan.inConflict).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 uses Shosuro Deceiver\'s gained ability from Shiba Yōjimbō to cancel the effects of Way of the Open Hand');
        });

        it('should lose reactions if the character is rehonored', function() {
            this.advisor.dishonor();
            this.artist.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan, this.deceiver, this.artist],
                defenders: [this.advisor, this.artist2],
                type: 'political'
            });

            let honor1 = this.player1.honor;
            let honor2 = this.player2.honor;

            this.player2.pass();
            this.player1.clickCard(this.soul);
            this.player1.clickCard(this.artist);
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.artist);
            expect(this.player1).not.toBeAbleToSelect(this.deceiver);

            this.player1.clickCard(this.artist);
            this.player1.clickCard(this.deceiver);

            expect(this.player1.honor).toBe(honor1 + 1);
            expect(this.player2.honor).toBe(honor2 - 1);
        });

        it('should not gain abilities on itself', function() {
            this.deceiver.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan, this.deceiver, this.artist],
                defenders: [this.advisor, this.artist2],
                type: 'political'
            });

            let honor1 = this.player1.honor;
            let honor2 = this.player2.honor;

            this.player2.pass();
            this.player1.playAttachment(this.words, this.deceiver);
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.deceiver);
            this.player1.clickCard(this.deceiver);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).not.toBeAbleToSelect(this.deceiver);
            this.player1.clickCard(this.deceiver);

            expect(this.player1.honor).toBe(honor1 + 1);
            expect(this.player2.honor).toBe(honor2 - 1);
        });
    });
});

describe('Shosuro Deceiver -  Two Deceivers', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['shosuro-deceiver', 'shosuro-deceiver', 'blackmail-artist']
                },
                player2: {
                    inPlay: ['beloved-advisor']
                }
            });

            this.deceiver1 = this.player1.filterCardsByName('shosuro-deceiver')[0];
            this.deceiver2 = this.player1.filterCardsByName('shosuro-deceiver')[1];
            this.artist = this.player1.findCardByName('blackmail-artist');

            this.advisor = this.player2.findCardByName('beloved-advisor');
        });

        it('should not gain abilities from other deceivers', function() {
            this.advisor.dishonor();
            this.deceiver1.dishonor();
            this.deceiver2.dishonor();
            this.artist.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.deceiver1, this.deceiver2, this.artist],
                defenders: [this.advisor],
                type: 'political'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.deceiver1);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            expect(this.getChatLogs(5)).toContain('player1 uses Shosuro Deceiver\'s gained ability from Beloved Advisor to draw 1 card');
        });

        it('should not gain abilities from other deceivers', function() {
            this.advisor.dishonor();
            this.deceiver1.dishonor();
            this.deceiver2.dishonor();
            this.artist.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.deceiver1, this.deceiver2, this.artist],
                defenders: [this.advisor],
                type: 'political'
            });

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.artist);
            expect(this.player1).toBeAbleToSelect(this.deceiver1);
            expect(this.player1).toBeAbleToSelect(this.deceiver2);

            this.player1.clickCard(this.deceiver1);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).not.toBeAbleToSelect(this.deceiver1);
            expect(this.player1).toBeAbleToSelect(this.deceiver2);
        });
    });
});
