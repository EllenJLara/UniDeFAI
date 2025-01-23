export class RequestQueue {
    private queue: Array<{
      resolve: (value: any) => void;
      reject: (error: any) => void;
      request: () => Promise<any>;
    }> = [];
    private processing = false;
    private lastRequestTime = 0;
    private MIN_REQUEST_INTERVAL = 1000;
  
    async add<T>(request: () => Promise<T>): Promise<T> {
      return new Promise((resolve, reject) => {
        this.queue.push({ resolve, reject, request });
        if (!this.processing) {
          this.processQueue();
        }
      });
    }
  
    private async processQueue() {
      if (this.queue.length === 0) {
        this.processing = false;
        return;
      }
  
      this.processing = true;
      const { request, resolve, reject } = this.queue.shift()!;
  
      const now = Date.now();
      const timeToWait = Math.max(0, this.MIN_REQUEST_INTERVAL - (now - this.lastRequestTime));
      
      if (timeToWait > 0) {
        await new Promise(resolve => setTimeout(resolve, timeToWait));
      }
  
      try {
        const result = await request();
        this.lastRequestTime = Date.now();
        resolve(result);
      } catch (error) {
        reject(error);
      }
  
      setTimeout(() => this.processQueue(), 0);
    }
  }
  
  export const requestQueue = new RequestQueue();