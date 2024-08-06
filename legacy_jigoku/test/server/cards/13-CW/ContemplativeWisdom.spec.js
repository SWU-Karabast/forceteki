describe('Contemplative Wisdom', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['master-alchemist', 'shiba-yojimbo', 'hantei-sotorii', 'isawa-ujina', 'seppun-truthseeker', 'kaiu-envoy', 'akodo-toturi', 'guest-of-honor', 'sincere-challenger'],
                    hand: ['contemplative-wisdom', 'common-cause']
                },
                player2: {
                    hand: ['mirumoto-s-fury']
                }
            });

            this.player1.player.showBid = 1;
            this.player2.player.showBid = 5;

            this.alchemist = this.player1.findCardByName('master-alchemist');
            this.yojimbo = this.player1.findCardByName('shiba-yojimbo'); //interrupt
            this.sotorii = this.player1.findCardByName('hantei-sotorii'); //action + pride
            this.ujina = this.player1.findCardByName('isawa-ujina'); //forced reaction
            this.truthseeker = this.player1.findCardByName('seppun-truthseeker'); //forced interrupt
            this.envoy = this.player1.findCardByName('kaiu-envoy'); //sincerity + courtesy
            this.toturi = this.player1.findCardByName('akodo-toturi'); //reaction
            this.guest = this.player1.findCardByName('guest-of-honor'); //constant ability
            this.sincere = this.player1.findCardByName('sincere-challenger'); //composure

            this.wisdom = this.player1.findCardByName('contemplative-wisdom');
            this.commonCause = this.player1.findCardByName('common-cause');
            this.fury = this.player2.findCardByName('mirumoto-s-fury');

            this.ujina.bowed = true;
        });

        it('should not work outside of conflicts', function() {
            this.player1.playAttachment(this.wisdom, this.sotorii);
            this.player2.pass();
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.sotorii);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not work without a ring', function() {
            this.player1.playAttachment(this.wisdom, this.sotorii);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.alchemist],
                defenders: [],
                type: 'military',
                ring: 'void'
            });

            this.player2.pass();
            this.player1.clickCard(this.sotorii);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should grant an ability that you can trigger if you have a ring to return', function() {
            this.player1.claimRing('water');
            this.player1.playAttachment(this.wisdom, this.sotorii);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.alchemist],
                defenders: [],
                type: 'military',
                ring: 'void'
            });

            this.player2.pass();
            this.player1.clickCard(this.sotorii);
            expect(this.player1).toHavePrompt('Choose a character');
        });

        it('should let you return a ring to give all abilities to the target', function() {
            this.player1.claimRing('water');
            this.player1.playAttachment(this.wisdom, this.sotorii);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.alchemist],
                defenders: [],
                type: 'military',
                ring: 'void'
            });

            this.player2.pass();
            this.player1.clickCard(this.sotorii);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.alchemist);
            expect(this.player1).not.toBeAbleToSelect(this.yojimbo);
            this.player1.clickCard(this.alchemist);
            expect(this.player1).toHavePrompt('Choose a ring to return');
            this.player1.clickRing('water');
            expect(this.getChatLogs(3)).toContain('player1 uses Hantei Sotorii\'s gained ability from Contemplative Wisdom, returning the Water Ring to give Master Alchemist all the printed abilities of Hantei Sotorii');
        });

        it('should give action abilities', function() {
            this.player1.claimRing('water');
            this.player1.playAttachment(this.wisdom, this.sotorii);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.alchemist],
                defenders: [],
                type: 'military',
                ring: 'void'
            });

            this.player2.pass();
            this.player1.clickCard(this.sotorii);
            this.player1.clickCard(this.alchemist);
            this.player1.clickRing('water');

            let glory = this.alchemist.glory;

            this.player2.pass();
            this.player1.clickCard(this.alchemist);
            expect(this.player1).toHavePrompt('Choose an ability:');
            expect(this.player1).toHavePromptButton('Honor or dishonor a character');
            expect(this.player1).toHavePromptButton('Give a participating character +3 glory');

            this.player1.clickPrompt('Give a participating character +3 glory');
            this.player1.clickCard(this.alchemist);
            expect(this.alchemist.glory).toBe(glory + 3);

            expect(this.getChatLogs(10)).toContain('player1 uses Master Alchemist\'s gained ability from Hantei Sotorii to give Master Alchemist +3 glory until the end of the conflict');
        });

        it('should give keywords (pride)', function() {
            this.player1.claimRing('water');
            this.player1.playAttachment(this.wisdom, this.sotorii);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.alchemist],
                defenders: [],
                type: 'military',
                ring: 'air'
            });

            this.player2.pass();
            this.player1.clickCard(this.sotorii);
            this.player1.clickCard(this.alchemist);
            this.player1.clickRing('water');
            this.noMoreActions();
            this.player1.clickPrompt('No');
            this.player1.clickPrompt('Don\'t Resolve');
            expect(this.alchemist.isHonored).toBe(true);

            expect(this.getChatLogs(10)).toContain('Master Alchemist is honored due to their Pride');
        });

        it('should give keywords (sincerity and courtesy)', function() {
            this.player1.claimRing('water');
            this.player1.playAttachment(this.wisdom, this.envoy);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.alchemist],
                defenders: [],
                type: 'military',
                ring: 'air'
            });

            let hand = this.player1.hand.length;
            let fate = this.player1.fate;

            this.player2.pass();
            this.player1.clickCard(this.envoy);
            this.player1.clickCard(this.alchemist);
            this.player1.clickRing('water');

            this.player2.pass();
            this.player1.clickCard(this.commonCause);
            this.player1.clickCard(this.ujina);
            this.player1.clickCard(this.alchemist);

            expect(this.player1.hand.length).toBe(hand); //-1 for common cause, +1 for sinccerity
            expect(this.player1.fate).toBe(fate + 1);

            expect(this.getChatLogs(10)).toContain('player1 gains a fate due to Master Alchemist\'s Courtesy');
            expect(this.getChatLogs(10)).toContain('player1 draws a card due to Master Alchemist\'s Sincerity');
        });

        it('should give interrupt abilities', function() {
            this.player1.claimRing('water');
            this.player1.playAttachment(this.wisdom, this.yojimbo);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.alchemist],
                defenders: [],
                type: 'military',
                ring: 'void'
            });

            this.player2.pass();
            this.player1.clickCard(this.yojimbo);
            this.player1.clickCard(this.alchemist);
            this.player1.clickRing('water');

            this.player2.clickCard(this.fury);
            this.player2.clickCard(this.alchemist);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.yojimbo);
            expect(this.player1).toBeAbleToSelect(this.alchemist);
            this.player1.clickCard(this.alchemist);

            expect(this.alchemist.bowed).toBe(false);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            expect(this.getChatLogs(10)).toContain('player1 uses Master Alchemist\'s gained ability from Shiba Yōjimbō to cancel the effects of Mirumoto\'s Fury');
        });

        it('should give forced reaction abilities', function() {
            this.player1.claimRing('water');
            this.player1.playAttachment(this.wisdom, this.ujina);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.alchemist],
                defenders: [],
                type: 'military',
                ring: 'void'
            });

            this.player2.pass();
            this.player1.clickCard(this.ujina);
            this.player1.clickCard(this.alchemist);
            this.player1.clickRing('water');

            this.noMoreActions();
            this.player1.clickPrompt('No');
            expect(this.player1).toHavePrompt('Isawa Ujina');
            this.player1.clickCard(this.sotorii);
            expect(this.player1).toHavePrompt('Master Alchemist');
            this.player1.clickCard(this.ujina);
            expect(this.getChatLogs(10)).toContain('player1 uses Master Alchemist\'s gained ability from Isawa Ujina to remove Isawa Ujina from the game');
            expect(this.ujina.location).toBe('removed from game');
        });

        it('should give reaction abilities', function() {
            this.player1.claimRing('water');
            this.player1.playAttachment(this.wisdom, this.toturi);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.alchemist],
                defenders: [],
                type: 'military',
                ring: 'air'
            });

            this.player2.pass();
            this.player1.clickCard(this.toturi);
            this.player1.clickCard(this.alchemist);
            this.player1.clickRing('water');

            let honor = this.player1.honor;

            this.noMoreActions();
            this.player1.clickPrompt('No');
            this.player1.clickPrompt('Gain 2 honor');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.alchemist);
            this.player1.clickCard(this.alchemist);
            this.player1.clickPrompt('Gain 2 honor');
            expect(this.player1.honor).toBe(honor + 4);
            expect(this.getChatLogs(10)).toContain('player1 uses Master Alchemist\'s gained ability from Akodo Toturi to resolve Air Ring');
        });

        it('should give forced interrupt abilities', function() {
            this.player1.claimRing('water');
            this.player1.playAttachment(this.wisdom, this.truthseeker);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.alchemist],
                defenders: [],
                type: 'military',
                ring: 'air'
            });

            this.player2.pass();
            this.player1.clickCard(this.truthseeker);
            this.player1.clickCard(this.alchemist);
            this.player1.clickRing('water');

            let hand = this.player1.hand.length;
            let hand2 = this.player2.hand.length;

            this.player2.pass();
            this.player1.clickCard(this.commonCause);
            this.player1.clickCard(this.ujina);
            this.player1.clickCard(this.alchemist);

            expect(this.player1.hand.length).toBe(hand + 1); //-1 for common cause, +2 from ability
            expect(this.player2.hand.length).toBe(hand2 + 2);

            expect(this.getChatLogs(10)).toContain('player1 uses Master Alchemist\'s gained ability from Seppun Truthseeker to make both players draw 2 cards');
        });

        it('should give constant abilities', function() {
            this.player1.claimRing('water');
            this.player1.playAttachment(this.wisdom, this.guest);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.alchemist],
                defenders: [],
                type: 'military',
                ring: 'void'
            });

            this.player2.pass();
            this.player1.clickCard(this.guest);
            this.player1.clickCard(this.alchemist);
            this.player1.clickRing('water');

            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.fury);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should give courtesy', function() {
            this.player1.claimRing('water');
            this.player1.playAttachment(this.wisdom, this.sincere);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.alchemist],
                defenders: [],
                type: 'military',
                ring: 'void'
            });

            this.player2.pass();
            this.player1.clickCard(this.sincere);
            this.player1.clickCard(this.alchemist);
            this.player1.clickRing('water');

            expect(this.alchemist.getPoliticalSkill()).toBe(this.alchemist.getBasePoliticalSkill() + 2);
        });

        it('should allow doubling up abilities by giving your ability to yourself', function() {
            this.player1.claimRing('water');
            this.player1.playAttachment(this.wisdom, this.alchemist);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.alchemist],
                defenders: [],
                type: 'military',
                ring: 'void'
            });

            this.player2.pass();
            this.player1.clickCard(this.alchemist);
            expect(this.player1).toHavePrompt('Choose an ability:');
            expect(this.player1).toHavePromptButton('Honor or dishonor a character');
            expect(this.player1).toHavePromptButton('Give all abilities to another character');
            this.player1.clickPrompt('Give all abilities to another character');
            this.player1.clickCard(this.alchemist);
            this.player1.clickRing('water');

            this.player2.pass();
            this.player1.clickCard(this.alchemist);
            expect(this.player1).toHavePrompt('Choose an ability:');
        });
    });
});
