describe('Know the Terrain', function() {
    integration(function() {
        describe('Know the Terrain\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['border-rider', 'guest-of-honor'],
                        hand: ['know-the-terrain', 'chasing-the-sun']
                    },
                    player2: {
                        inPlay: ['doji-whisperer'],
                        hand: ['know-the-terrain', 'talisman-of-the-sun'],
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
                this.p1Terrain = this.player1.findCardByName('know-the-terrain');
                this.chasing = this.player1.findCardByName('chasing-the-sun');

                this.whisperer = this.player2.findCardByName('doji-whisperer');
                this.p2Terrain = this.player2.findCardByName('know-the-terrain');
                this.talisman = this.player2.findCardByName('talisman-of-the-sun');

                this.player1.pass();
                this.player2.playAttachment(this.talisman, this.whisperer);
                this.noMoreActions();
            });

            it('should interrupt the province being revealed if it is facedown', function() {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    province: this.rally
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.p2Terrain);
                expect(this.rally.facedown).toBe(true);
            });

            it('should not interrupt the province being revealed if it is faceup', function() {
                this.rally.facedown = false;
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    province: this.rally
                });
                expect(this.player2).toHavePrompt('Choose Defenders');
                expect(this.rally.facedown).toBe(false);
            });

            it('should not interrupt the province being revealed if it is the stronghold province', function() {
                this.rally.isBroken = true;
                this.cache.isBroken = true;
                this.garden.isBroken = true;
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    province: this.shameful
                });
                expect(this.player2).toHavePrompt('Choose Defenders');
                expect(this.shameful.facedown).toBe(false);
            });

            it('should not interrupt a province being revealed after conflict declaration', function() {
                this.rally.facedown = false;
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    defenders: [],
                    province: this.rally
                });

                this.player2.clickCard(this.talisman);
                this.player2.clickCard(this.endless);
                expect(this.player2).toHavePrompt('Waiting for opponent to take an action or pass');
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('should let you select a facedown unbroken non-stronghold province that is not being attacked', function() {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    province: this.rally
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.p2Terrain);
                expect(this.rally.facedown).toBe(true);
                this.player2.clickCard(this.p2Terrain);
                expect(this.player2).not.toBeAbleToSelect(this.rally);
                expect(this.player2).toBeAbleToSelect(this.endless);
                expect(this.player2).toBeAbleToSelect(this.cache);
                expect(this.player2).toBeAbleToSelect(this.garden);
                expect(this.player2).not.toBeAbleToSelect(this.shameful);
            });

            it('should not let you select faceup or broken provinces', function() {
                this.cache.facedown = false;
                this.endless.facedown = false;
                this.endless.isBroken = true;
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    province: this.rally
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.p2Terrain);
                expect(this.rally.facedown).toBe(true);
                this.player2.clickCard(this.p2Terrain);
                expect(this.player2).not.toBeAbleToSelect(this.rally);
                expect(this.player2).not.toBeAbleToSelect(this.endless);
                expect(this.player2).not.toBeAbleToSelect(this.cache);
                expect(this.player2).toBeAbleToSelect(this.garden);
                expect(this.player2).not.toBeAbleToSelect(this.shameful);
            });

            it('should switch the provinces', function() {
                let rallyLocation = this.rally.location;
                let gardenLocation = this.garden.location;

                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    province: this.rally
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.p2Terrain);
                expect(this.rally.facedown).toBe(true);
                this.player2.clickCard(this.p2Terrain);
                expect(this.player2).not.toBeAbleToSelect(this.rally);
                expect(this.player2).toBeAbleToSelect(this.endless);
                expect(this.player2).toBeAbleToSelect(this.cache);
                expect(this.player2).toBeAbleToSelect(this.garden);
                expect(this.player2).not.toBeAbleToSelect(this.shameful);

                this.player2.clickCard(this.garden);
                expect(this.rally.facedown).toBe(true);
                expect(this.garden.facedown).toBe(false);
                expect(this.rally.location).toBe(gardenLocation);
                expect(this.garden.location).toBe(rallyLocation);
                expect(this.getChatLogs(4)).toContain('player1 is initiating a military conflict at province 2, contesting Air Ring');
                expect(this.getChatLogs(3)).toContain('player2 plays Know the Terrain to switch the attacked province card');
                expect(this.getChatLogs(2)).toContain('player1 reveals Manicured Garden due to Framework effect');
            });

            it('should allow reactions on the new provinces to be used', function() {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    province: this.rally
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.p2Terrain);
                expect(this.rally.facedown).toBe(true);
                this.player2.clickCard(this.p2Terrain);
                expect(this.player2).not.toBeAbleToSelect(this.rally);
                expect(this.player2).toBeAbleToSelect(this.endless);
                expect(this.player2).toBeAbleToSelect(this.cache);
                expect(this.player2).toBeAbleToSelect(this.garden);
                expect(this.player2).not.toBeAbleToSelect(this.shameful);

                this.player2.clickCard(this.cache);
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
                        inPlay: ['bayushi-kachiko', 'togashi-mitsu'],
                        hand: ['know-the-terrain', 'castigated', 'mantra-of-fire'],
                        conflictDiscard: ['the-crashing-wave'],
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

                this.terrain = this.player2.findCardByName('know-the-terrain');
                this.mantra = this.player2.findCardByName('mantra-of-fire');
                this.mitsu = this.player2.findCardByName('togashi-mitsu');
                this.crashingWave = this.player2.findCardByName('the-crashing-wave');

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                this.garden.facedown = false;

                this.noMoreActions();

                this.player1.clickCard(this.gisei);
                this.player1.clickRing('earth');
                this.game.rings.void.fate = 1;
            });

            it('guest should not prevent triggering (characters should not be participating yet)', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.guest],
                    province: this.rally
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.terrain);
                expect(this.rally.facedown).toBe(true);
                this.player2.clickCard(this.terrain);
                expect(this.player2).toHavePrompt('Know The Terrain');
                expect(this.player2).not.toBeAbleToSelect(this.shameful);
            });

            it('gisei toshi should not prevent triggering (ring should not be contested yet)', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.gisei],
                    province: this.rally,
                    ring: 'earth'
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.terrain);
                expect(this.rally.facedown).toBe(true);
                this.player2.clickCard(this.terrain);
                expect(this.player2).toHavePrompt('Know The Terrain');
                expect(this.player2).toBeAbleToSelect(this.cache);
            });

            it('should trigger before fate is taken from rings', function() {
                let fate = this.player1.fate;

                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.gisei],
                    province: this.rally,
                    ring: 'void'
                });
                expect(this.player1.fate).toBe(fate);
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.terrain);
                expect(this.rally.facedown).toBe(true);
            });

            it('should trigger before Yuikimi', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.yuikimi],
                    province: this.rally,
                    ring: 'void'
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.terrain);
                expect(this.rally.facedown).toBe(true);
                this.player2.clickCard(this.terrain);
                expect(this.player2).toHavePrompt('Know The Terrain');
                expect(this.player2).toBeAbleToSelect(this.cache);
            });

            it('should fizzle the conflict if your only attacker dies', function() {
                let fate = this.player1.fate;
                this.player1.moveCard(this.edict, 'hand');
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.kiyono],
                    defenders: [],
                    province: this.garden,
                    ring: 'air'
                });

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
                    province: this.rally,
                    ring: 'void'
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.terrain);
                expect(this.rally.facedown).toBe(true);
                this.player2.clickCard(this.terrain);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.edict);
                this.player1.clickCard(this.edict);
                this.player1.clickCard(this.kiyono);
                expect (this.kiyono.location).toBe('dynasty discard pile');
                expect(this.player1.fate).toBe(fate);

                expect(this.getChatLogs(3)).toContain('player1 has failed to initiate a conflict because they no longer have any legal attackers');
                expect(this.rally.facedown).toBe(true);
            });

            it('if the conflict fizzles should not allow reactions to declaration (mantra test)', function() {
                let fate = this.player1.fate;
                this.player1.moveCard(this.edict, 'hand');
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.kiyono],
                    defenders: [],
                    province: this.garden,
                    ring: 'air'
                });

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
                    province: this.rally,
                    ring: 'fire'
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.terrain);
                expect(this.rally.facedown).toBe(true);
                this.player2.clickCard(this.terrain);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.edict);
                this.player1.clickCard(this.edict);
                this.player1.clickCard(this.kiyono);
                expect (this.kiyono.location).toBe('dynasty discard pile');
                expect(this.player1.fate).toBe(fate);
                expect(this.getChatLogs(3)).toContain('player1 has failed to initiate a conflict because they no longer have any legal attackers');
                expect(this.player2).not.toHavePrompt('Triggered Abilities');
                expect(this.player1).toHavePrompt('Action Window');
            });

            it('if the conflict fizzles should not allow reactions to declaration (crashing wave)', function() {
                let fate = this.player1.fate;
                this.player1.moveCard(this.edict, 'hand');
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.kiyono],
                    defenders: [],
                    province: this.garden,
                    ring: 'air'
                });

                this.player2.clickCard(this.castigated);
                this.player2.clickCard(this.kiyono);

                this.noMoreActions();
                this.player1.clickPrompt('Don\'t Resolve');
                this.kiyono.bowed = false;
                this.player2.moveCard(this.crashingWave, 'hand');
                this.noMoreActions();
                this.player2.passConflict();
                this.noMoreActions();

                this.initiateConflict({
                    type: 'military',
                    attackers: [this.kiyono],
                    province: this.rally,
                    ring: 'fire'
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.terrain);
                expect(this.rally.facedown).toBe(true);
                this.player2.clickCard(this.terrain);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.edict);
                this.player1.clickCard(this.edict);
                this.player1.clickCard(this.kiyono);
                expect (this.kiyono.location).toBe('dynasty discard pile');
                expect(this.player1.fate).toBe(fate);
                expect(this.getChatLogs(3)).toContain('player1 has failed to initiate a conflict because they no longer have any legal attackers');
                expect(this.player2).not.toHavePrompt('Triggered Abilities');
                expect(this.player1).toHavePrompt('Action Window');
            });
        });
    });
});
