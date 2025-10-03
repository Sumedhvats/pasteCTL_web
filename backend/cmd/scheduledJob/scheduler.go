package Scheduledjob

import (
	"log"
	"time"

	pasteService "github.com/Sumedhvats/pasteCTL_web/internal/paste"
)
func StartScheduler(svc pasteService.PasteService) {
	// Create a Ticker that ticks every 2 hours
	ticker := time.NewTicker(2 * time.Hour)
	defer ticker.Stop()

	// An infinite loop to run the scheduler
	for range ticker.C {
		log.Println("Running scheduled paste cleanup...")
		if err := svc.DeleteExpiredPastes(); err != nil {
			log.Printf("Scheduler failed to clean up pastes: %v", err)
		}
		log.Println("Scheduled paste cleanup finished.")
	}
}