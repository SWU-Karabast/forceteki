describe('Mercenary Company', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['mercenary-company', 'doji-kuwanan', 'daidoji-uji']
                },
                player2: {
                    inPlay: ['akodo-toturi-2', 'togashi-yokuni'],
                    provinces: ['manicured-garden', 'blood-of-onnotangu']
                }
            });
            this.company = this.player1.findCardByName('mercenary-company');
            this.toturi = this.player2.findCardByName('akodo-toturi-2');
            this.yokuni = this.player2.findCardByName('togashi-yokuni');
            this.garden = this.player2.findCardByName('manicured-garden');
            this.blood = this.player2.findCardByName('blood-of-onnotangu');

            this.noMoreActions();
        });

        it('should prompt opponent to put a fate if this loses a conflict', function() {
            this.initiateConflict({
                type: 'military',
                attackers: [this.company],
                defenders: [this.toturi, this.yokuni],
                province: this.garden
            });

            this.noMoreActions();
            expect(this.player2).toHavePrompt('Place a fate on Mercenary Company to take control of it?');
            expect(this.player2).toHavePromptButton('Yes');
            expect(this.player2).toHavePromptButton('No');
        });

        it('should not prompt opponent if they have no fate even if this loses a conflict', function() {
            this.player2.fate = 0;
            this.initiateConflict({
                type: 'military',
                attackers: [this.company],
                defenders: [this.toturi, this.yokuni],
                province: this.garden
            });

            this.noMoreActions();
            expect(this.player2).not.toHavePrompt('Place a fate on Mercenary Company to take control of it?');
        });

        it('should not prompt opponent if this wins a conflict', function() {
            this.initiateConflict({
                type: 'military',
                attackers: [this.company],
                defenders: [this.toturi],
                province: this.garden
            });

            this.noMoreActions();
            expect(this.player2).not.toHavePrompt('Place a fate on Mercenary Company to take control of it?');
        });

        it('should move a fate and take control of the company', function() {
            this.initiateConflict({
                type: 'military',
                attackers: [this.company],
                defenders: [this.toturi, this.yokuni],
                province: this.garden
            });

            let cFate = this.company.fate;
            let pFate = this.player2.fate;

            this.noMoreActions();
            expect(this.player2).toHavePrompt('Place a fate on Mercenary Company to take control of it?');
            expect(this.company.controller).toBe(this.player1.player);
            this.player2.clickPrompt('Yes');
            expect(this.company.controller).toBe(this.player2.player);
            expect(this.company.fate).toBe(cFate + 1);
            expect(this.player2.fate).toBe(pFate - 1);

            expect(this.getChatLogs(10)).toContain('player1 uses Mercenary Company to let player2 hire their services');
            expect(this.getChatLogs(10)).toContain('player2 places a fate on and takes control of Mercenary Company');
        });

        it('should allow switching back', function() {
            this.initiateConflict({
                type: 'military',
                attackers: [this.company],
                defenders: [this.toturi, this.yokuni],
                province: this.garden
            });
            this.noMoreActions();
            this.player2.clickPrompt('Yes');

            this.company.bowed = false;

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.company],
                defenders: ['doji-kuwanan', 'daidoji-uji'],
                ring: 'earth'
            });

            let cFate = this.company.fate;
            let pFate = this.player1.fate;

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Place a fate on Mercenary Company to take control of it?');
            expect(this.company.controller).toBe(this.player2.player);
            this.player1.clickPrompt('Yes');
            expect(this.company.controller).toBe(this.player1.player);
            expect(this.company.fate).toBe(cFate + 1);
            expect(this.player1.fate).toBe(pFate - 1);

            expect(this.getChatLogs(10)).toContain('player2 uses Mercenary Company to let player1 hire their services');
            expect(this.getChatLogs(10)).toContain('player1 places a fate on and takes control of Mercenary Company');
        });

        it('should not let you take control if you cannot spend fate', function() {
            this.initiateConflict({
                type: 'military',
                attackers: [this.company],
                defenders: [this.toturi, this.yokuni],
                province: this.blood
            });

            this.noMoreActions();
            expect(this.player2).not.toHavePrompt('Place a fate on Mercenary Company to take control of it?');
        });
    });
});
