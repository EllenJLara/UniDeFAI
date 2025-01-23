class RateLimiter {
    private queue: (() => Promise<void>)[] = [];
    private processing = false;
    private lastBatchTime = 0;
    private batchSize: number;
    private intervalMs: number;
  
    constructor(requestsPerBatch: number, intervalSeconds: number) {
      this.batchSize = requestsPerBatch;
      this.intervalMs = intervalSeconds * 1000;
    }
  
    async add(task: () => Promise<void>): Promise<void> {
      return new Promise((resolve, reject) => {
        this.queue.push(async () => {
          try {
            await task();
            resolve();
          } catch (error) {
            reject(error);
          }
        });
        
        if (!this.processing) {
          this.process();
        }
      });
    }
  
    private async process() {
      this.processing = true;
      
      while (this.queue.length > 0) {
        const now = Date.now();
        const timeSinceLastBatch = now - this.lastBatchTime;
        
        if (timeSinceLastBatch < this.intervalMs) {
          await new Promise(resolve => 
            setTimeout(resolve, this.intervalMs - timeSinceLastBatch)
          );
        }
  
        const batch = this.queue.splice(0, this.batchSize);
        this.lastBatchTime = Date.now();
        
        await Promise.all(batch.map(task => task()));
      }
  
      this.processing = false;
    }
  }
export default RateLimiter;  