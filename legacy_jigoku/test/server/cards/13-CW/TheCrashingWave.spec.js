describe('The Crashing Wave', function() {
    integration(function() {
        describe('The Crashing Wave\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['border-rider', 'guest-of-honor'],
                        hand: ['the-crashing-wave', 'chasing-the-sun']
                    },
                    player2: {
                        inPlay: ['doji-whisperer'],
                        hand: ['the-crashing-wave', 'talisman-of-the-sun'],
                        provinces: ['endless-plains', 'rally-to-the-cause', 'secret-cache', 'manicured-garden'],
                        role: 'keeper-of-void'
                    }
                });
                this.endless = this.player2.findCardByName('endless-plains');
                this.rally = this.player2.findCardByName('rally-to-the-cause');
                this.cache = this.player2.findCardByName('secret-cache');
                this.garden = this.player2.findCardByName('manicured-garden');
                this.shameful = this.player2.findCardByName('shameful-display', 'stronghold province');

                this.rider = this.player1.findCardByName('border-rider');
                this.p1Wave = this.player1.findCardByName('the-crashing-wave');
                this.chasing = this.player1.findCardByName('chasing-the-sun');

                this.whisperer = this.player2.findCardByName('doji-whisperer');
                this.p2Wave = this.player2.findCardByName('the-crashing-wave');
                this.talisman = this.player2.findCardByName('talisman-of-the-sun');

                this.player1.pass();
                this.player2.playAttachment(this.talisman, this.whisperer);
                this.noMoreActions();
            });

            it('should react before the province is revealed if it is facedown', function() {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    province: this.rally
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.p2Wave);
                expect(this.rally.facedown).toBe(true);
            });

            it('should react if the province is faceup', function() {
                this.rally.facedown = false;
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    province: this.rally
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.p2Wave);
                expect(this.rally.facedown).toBe(false);
            });

            it('should react to the stronghold province', function() {
                this.rally.isBroken = true;
                this.cache.isBroken = true;
                this.garden.isBroken = true;
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    province: this.shameful
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.p2Wave);
                expect(this.shameful.facedown).toBe(true);
            });

            it('should let you select an eligible province that is not being attacked', function() {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    province: this.rally
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.p2Wave);
                expect(this.rally.facedown).toBe(true);
                this.player2.clickCard(this.p2Wave);
                expect(this.player2).not.toBeAbleToSelect(this.rally);
                expect(this.player2).toBeAbleToSelect(this.endless);
                expect(this.player2).toBeAbleToSelect(this.cache);
                expect(this.player2).toBeAbleToSelect(this.garden);
                expect(this.player2).not.toBeAbleToSelect(this.shameful);
            });

            it('should not let you select broken provinces', function() {
                this.cache.facedown = false;
                this.endless.facedown = false;
                this.endless.isBroken = true;
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    province: this.rally
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.p2Wave);
                expect(this.rally.facedown).toBe(true);
                this.player2.clickCard(this.p2Wave);
                expect(this.player2).not.toBeAbleToSelect(this.rally);
                expect(this.player2).not.toBeAbleToSelect(this.endless);
                expect(this.player2).toBeAbleToSelect(this.cache);
                expect(this.player2).toBeAbleToSelect(this.garden);
                expect(this.player2).not.toBeAbleToSelect(this.shameful);
            });

            it('should move the conflict', function() {
                let rallyLocation = this.rally.location;
                let gardenLocation = this.garden.location;

                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    province: this.rally
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.p2Wave);
                expect(this.rally.facedown).toBe(true);
                this.player2.clickCard(this.p2Wave);
                expect(this.player2).not.toBeAbleToSelect(this.rally);
                expect(this.player2).toBeAbleToSelect(this.garden);

                this.player2.clickCard(this.garden);
                expect(this.garden.facedown).toBe(false);
                expect(this.rally.location).toBe(rallyLocation);
                expect(this.garden.location).toBe(gardenLocation);
                expect(this.getChatLogs(4)).toContain('player1 is initiating a military conflict at province 2, contesting Air Ring');
                expect(this.getChatLogs(3)).toContain('player2 plays The Crashing Wave to move the conflict to Manicured Garden');
            });

            it('should allow reactions on reveal for the new province to be used', function() {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    province: this.endless
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.p2Wave);
                this.player2.clickCard(this.p2Wave);
                this.player2.clickCard(this.rally);
                expect(this.player2).toHavePrompt('Triggered Abilities');
                this.player2.clickCard(this.rally);
                expect(this.getChatLogs(5)).toContain('player1 is initiating a military conflict at province 1, contesting Air Ring');
                expect(this.getChatLogs(4)).toContain('player2 plays The Crashing Wave to move the conflict to Rally to the Cause');
                expect(this.getChatLogs(4)).toContain('player2 uses Rally to the Cause to switch the conflict type');
                expect(this.getChatLogs(4)).toContain('player1 has initiated a political conflict with skill 1');
            });

            it('should allow reactions on conflict declared on the old province to be used, not the new province (old province facedown)', function() {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    province: this.endless
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.p2Wave);
                expect(this.rally.facedown).toBe(true);
                this.player2.clickCard(this.p2Wave);
                this.player2.clickCard(this.cache);
                expect(this.player2).not.toHavePrompt('Triggered Abilities');
                expect(this.player2).toHavePrompt('Choose Defenders');
            });

            it('should allow reactions on conflict declared on the old province to be used, not the new province (old province faceup)', function() {
                this.endless.facedown = false;
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    province: this.endless
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.p2Wave);
                expect(this.rally.facedown).toBe(true);
                this.player2.clickCard(this.p2Wave);
                this.player2.clickCard(this.cache);
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.endless);
                this.player2.clickCard(this.endless);
                expect(this.player1).toHavePrompt('Break Endless Plains');
            });

            it('should allow reactions on conflict declared on the old province to be used, not the new province (secondary test)', function() {
                this.cache.facedown = false;
                this.endless.facedown = false;
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    province: this.cache
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.p2Wave);
                expect(this.rally.facedown).toBe(true);
                this.player2.clickCard(this.p2Wave);
                this.player2.clickCard(this.endless);
                expect(this.player2).toHavePrompt('Triggered Abilities');
                this.player2.clickCard(this.cache);
                expect(this.player2).toHavePrompt('Select a card');
            });
        });

        describe('Checking edge case interactions', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'draw',
                    player1: {
                        inPlay: ['master-of-gisei-toshi', 'guest-of-honor', 'ikoma-kiyono', 'kitsuki-yuikimi'],
                        conflictDiscard: ['forged-edict']
                    },
                    player2: {
                        inPlay: ['bayushi-kachiko'],
                        hand: ['the-crashing-wave', 'castigated'],
                        provinces: ['endless-plains', 'rally-to-the-cause', 'secret-cache', 'manicured-garden'],
                        role: 'keeper-of-void'
                    }
                });
                this.endless = this.player2.findCardByName('endless-plains');
                this.rally = this.player2.findCardByName('rally-to-the-cause');
                this.cache = this.player2.findCardByName('secret-cache');
                this.garden = this.player2.findCardByName('manicured-garden');
                this.shameful = this.player2.findCardByName('shameful-display', 'stronghold province');

                this.gisei = this.player1.findCardByName('master-of-gisei-toshi');
                this.yuikimi = this.player1.findCardByName('kitsuki-yuikimi');
                this.guest = this.player1.findCardByName('guest-of-honor');
                this.kiyono = this.player1.findCardByName('ikoma-kiyono');
                this.castigated = this.player2.findCardByName('castigated');
                this.edict = this.player1.findCardByName('forged-edict');

                this.wave = this.player2.findCardByName('the-crashing-wave');

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                this.garden.facedown = false;

                this.noMoreActions();

                this.player1.clickCard(this.gisei);
                this.player1.clickRing('fire');
                this.game.rings.void.fate = 2;
            });

            it('guest should prevent triggering (characters should be participating)', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.guest],
                    province: this.garden
                });
                expect(this.player2).not.toHavePrompt('Triggered Abilities');
                expect(this.player2).toHavePrompt('Choose Defenders');
            });

            it('gisei toshi should prevent triggering (ring should be contested)', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.gisei],
                    province: this.garden,
                    ring: 'fire'
                });
                expect(this.player2).not.toHavePrompt('Triggered Abilities');
                expect(this.player2).toHavePrompt('Choose Defenders');
            });

            it('should trigger after fate is taken from rings', function() {
                let fate = this.player1.fate;

                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.gisei],
                    province: this.garden,
                    ring: 'void'
                });

                expect(this.player1.fate).toBe(fate + 2);
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.wave);
                expect(this.rally.facedown).toBe(true);
                this.player2.clickCard(this.wave);
            });

            it('should trigger before Yuikimi', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.yuikimi],
                    province: this.garden,
                    ring: 'void'
                });
                expect(this.player1).not.toHavePrompt('Triggered Abilities');
                expect(this.player1).not.toBeAbleToSelect(this.yuikimi);
            });

            it('should allow the conflict to continue even if your only attacker dies', function() {
                let fate = this.player1.fate;
                this.player1.moveCard(this.edict, 'hand');
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.kiyono],
                    province: this.garden,
                    ring: 'air'
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                this.player2.pass();
                expect(this.player2).toHavePrompt('Choose Defenders');
                this.player2.clickPrompt('Done');
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.castigated);
                this.player2.clickCard(this.kiyono);

                this.noMoreActions();
                this.player1.clickPrompt('Don\'t Resolve');
                this.kiyono.bowed = false;
                this.noMoreActions();
                this.player2.passConflict();
                this.noMoreActions();

                this.initiateConflict({
                    type: 'military',
                    attackers: [this.kiyono],
                    province: this.garden,
                    ring: 'void'
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.wave);
                this.player2.clickCard(this.wave);
                this.player2.clickCard(this.cache);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.edict);
                this.player1.clickCard(this.edict);
                this.player1.clickCard(this.kiyono);
                expect (this.kiyono.location).toBe('dynasty discard pile');
                expect(this.player1.fate).toBe(fate + 2);

                expect(this.getChatLogs(3)).toContain('player1 has initiated a military conflict with skill 0');
            });
        });
    });
});
